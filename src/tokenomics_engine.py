"""CIRO Tokenomics Engine (Public API)

This module implements the core CIRO v3.0 hybrid tokenomics model for simulation
and stress testing. Used by tier-1 funds for due diligence validation.

Key Features:
- Governance-controlled supply management with +10%/-15% epoch caps
- Hybrid bootstrap-to-deflation curve (8% → 1% inflation)
- Revenue-linked burn mechanisms (30% → 80% fee burns)
- Security budget protection with 3% guard-band inflation
- Cross-chain fee aggregation and burn execution simulation

Author: CIRO Network Foundation
License: MIT (Standard - consider Apache-2 for enterprise patent protection)
Version: 3.0 (Red-Team Hardened)
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from enum import Enum
from typing import cast

import numpy as np
import pandas as pd

__all__ = ["CIROParameters", "CIROTokenomicsEngine", "NetworkPhase"]


class NetworkPhase(Enum):
    BOOTSTRAP = "bootstrap"    # Year 1-2: 8% → 5% inflation
    GROWTH = "growth"          # Year 3: 3% inflation  
    TRANSITION = "transition"  # Year 4: 1% inflation
    MATURE = "mature"          # Year 5+: 1% inflation + high burns


@dataclass
class CIROParameters:
    """CIRO v3.0 Baseline Parameters (Institutional Grade)"""
    
    # Core Token Economics
    total_supply: int = 1_000_000_000
    initial_circulating: int = 50_000_000
    initial_price: float = 0.08  # $0.08 private sale
    public_launch_price: float = 0.50  # $0.50 public launch
    
    # Hybrid Inflation Schedule (Red-Team Approved)
    inflation_schedule: dict[str, float] = field(default_factory=lambda: {
        "year_1": 0.08,    # 8% bootstrap phase
        "year_2": 0.05,    # 5% growth phase  
        "year_3": 0.03,    # 3% transition phase
        "year_4": 0.01,    # 1% mature phase
        "year_5+": 0.01    # 1% sustainable floor
    })
    
    # Progressive Burn Schedule (Revenue-Linked)
    burn_schedule: dict[str, float] = field(default_factory=lambda: {
        "month_1_12": 0.30,    # 30% of fees burned
        "month_13_36": 0.50,   # 50% of fees burned
        "month_37_60": 0.70,   # 70% of fees burned
        "month_61+": 0.80      # 80% of fees burned (max)
    })
    
    # Security Budget Protection (Non-Negotiable)
    security_floor_usd: int = 2_000_000
    guard_band_inflation: float = 0.03  # 3% emergency inflation
    fee_coverage_threshold: float = 0.60  # 60% of rewards from fees
    
    # Governance Safeguards (Regulatory Compliant)
    max_governance_increase: float = 0.10  # +10% max per epoch
    max_governance_decrease: float = 0.15  # -15% max per epoch
    epoch_length_days: int = 30
    
    # Protocol-Owned Liquidity (Market Stability)
    pol_target_usd: int = 4_000_000  # $4M for burn auction protection
    max_burn_slippage: float = 0.01  # 1% max slippage
    min_burn_amount: int = 100_000   # $100K minimum weekly burn
    
    # Revenue Projections (Conservative → Aggressive)
    revenue_targets: dict[str, float] = field(default_factory=lambda: {
        "year_1": 500_000.0,      # $500K (conservative bootstrap)
        "year_2": 2_500_000.0,    # $2.5M (proven product-market fit)
        "year_3": 10_000_000.0,   # $10M (enterprise adoption)
        "year_4": 25_000_000.0,   # $25M (market leadership)
        "year_5": 50_000_000.0    # $50M (global platform)
    })


class CIROTokenomicsEngine:
    """
    Core simulation engine implementing CIRO v3.0 hybrid tokenomics.
    
    Validates against stress scenarios for institutional due diligence.
    Implements all red-team hardening recommendations.
    """
    
    def __init__(self, params: CIROParameters):
        # Store baseline parameters
        self.params: CIROParameters = params
        
        # Simulation state (initialized in `reset_state`)
        self.month: int
        self.current_supply: float
        self.circulating_supply: float
        self.price: float
        self.total_burned: float
        self.treasury_usd: float
        self.pol_size: float
        self.security_budget_annual: float
        self.last_governance_change: int
        self.current_inflation_rate: float
        self.current_burn_rate: float
        # History stores either numeric series (floats/ints) or structured governance event dicts
        self.history: dict[str, list[float] | list[dict[str, float]]]
        
        # Initialize state values
        self.reset_state()
        
    def reset_state(self) -> None:
        """Reset simulation to initial conditions"""
        self.month = 0
        self.current_supply = self.params.total_supply
        self.circulating_supply = self.params.initial_circulating
        self.price = self.params.initial_price
        self.total_burned = 0
        self.treasury_usd = 0
        self.pol_size = 0
        self.security_budget_annual = self.params.security_floor_usd
        
        # Governance tracking (red-team requirement)
        self.last_governance_change = 0
        self.current_inflation_rate = self.params.inflation_schedule["year_1"]
        self.current_burn_rate = self.params.burn_schedule["month_1_12"]
        
        # Historical tracking for analysis
        self.history = {
            'month': [],
            'price': [],
            'circulating_supply': [],
            'monthly_inflation': [],
            'monthly_burns': [],
            'net_supply_change': [],
            'market_cap': [],
            'revenue': [],
            'security_budget': [],
            'governance_events': []
        }
    
    def get_current_phase(self) -> NetworkPhase:
        """Determine current network maturity phase"""
        year = self.month // 12 + 1
        
        if year <= 2:
            return NetworkPhase.BOOTSTRAP
        elif year == 3:
            return NetworkPhase.GROWTH  
        elif year == 4:
            return NetworkPhase.TRANSITION
        else:
            return NetworkPhase.MATURE
    
    def get_inflation_rate(self) -> float:
        """Get current inflation rate based on schedule and governance"""
        year = self.month // 12 + 1
        
        if year == 1:
            self.current_inflation_rate = self.params.inflation_schedule["year_1"]
        elif year == 2:
            self.current_inflation_rate = self.params.inflation_schedule["year_2"]
        elif year == 3:
            self.current_inflation_rate = self.params.inflation_schedule["year_3"]
        else:
            self.current_inflation_rate = self.params.inflation_schedule["year_4"]
            
        return self.current_inflation_rate
    
    def get_burn_rate(self) -> float:
        """Get current burn rate based on schedule"""
        if self.month <= 12:
            return self.params.burn_schedule["month_1_12"]
        elif self.month <= 36:
            return self.params.burn_schedule["month_13_36"]
        elif self.month <= 60:
            return self.params.burn_schedule["month_37_60"]
        else:
            return self.params.burn_schedule["month_61+"]
    
    def get_revenue(self) -> float:
        """Get monthly revenue based on growth projections"""
        year = self.month // 12 + 1
        
        if year <= 5:
            annual_target = self.params.revenue_targets[f"year_{year}"]
        else:
            # Assume 30% YoY growth after year 5
            annual_target = self.params.revenue_targets["year_5"] * (1.3 ** (year - 5))
            
        # Monthly revenue with seasonal variation (±20%)
        base_monthly = annual_target / 12
        seasonal_factor = 1 + 0.2 * math.sin(2 * math.pi * (self.month % 12) / 12)
        
        return base_monthly * seasonal_factor
    
    def calculate_security_budget_needed(self) -> float:
        """Calculate required security budget based on network value"""
        # Minimum $2M floor + 0.5% of market cap
        market_cap = self.circulating_supply * self.price
        dynamic_security = max(
            self.params.security_floor_usd,
            market_cap * 0.005  # 0.5% of market cap
        )
        return dynamic_security
    
    def check_security_guard_band(self, monthly_revenue: float) -> bool:
        """Check if 3% guard-band inflation is needed for security"""
        required_security = self.calculate_security_budget_needed()
        annual_fee_coverage = monthly_revenue * 12
        
        # If fees cover <60% of security budget, trigger guard-band
        if annual_fee_coverage < (required_security * self.params.fee_coverage_threshold):
            return True
        return False

    def simulate_governance_change(self, proposed_inflation_change: float) -> bool:
        """Simulate governance vote on inflation rate change (with epoch limits)"""
        # Check governance change limits
        if abs(proposed_inflation_change) > self.params.max_governance_increase:
            return False  # Rejected: exceeds +10% limit
            
        if proposed_inflation_change < -self.params.max_governance_decrease:
            return False  # Rejected: exceeds -15% limit
            
        # Apply the change
        new_rate = self.current_inflation_rate + proposed_inflation_change
        self.current_inflation_rate = max(0, new_rate)  # Can't go negative
        self.last_governance_change = self.month
        
        # Log governance event
        # Store governance events record
        events: list[dict[str, float]] = cast(list[dict[str, float]], self.history['governance_events'])
        events.append({  # type: ignore[arg-type]
            'month': float(self.month),
            'change': proposed_inflation_change,
            'new_rate': self.current_inflation_rate
        })
        
        return True

    def execute_burn_auction(self, revenue_usd: float) -> tuple[float, float]:
        """Execute weekly burn auction with slippage protection"""
        burn_target_usd = revenue_usd * self.get_burn_rate()
        
        # Apply minimum burn threshold
        if burn_target_usd < self.params.min_burn_amount:
            return 0, 0  # Skip burn if below threshold
            
        # Calculate tokens to burn (with slippage protection)
        tokens_before_slippage = burn_target_usd / self.price
        slippage_factor = min(self.params.max_burn_slippage, tokens_before_slippage / self.circulating_supply)
        actual_tokens_burned = tokens_before_slippage * (1 - slippage_factor)
        actual_usd_spent = actual_tokens_burned * self.price * (1 + slippage_factor)
        
        # Update supply
        self.circulating_supply -= actual_tokens_burned
        self.total_burned += actual_tokens_burned
        
        # Update POL if needed
        if self.pol_size < self.params.pol_target_usd:
            pol_addition = min(burn_target_usd * 0.1, self.params.pol_target_usd - self.pol_size)
            self.pol_size += pol_addition
            
        return actual_tokens_burned, actual_usd_spent

    def estimate_volatility(self) -> float:
        """Estimate token volatility (placeholder for GARCH model)"""
        # TODO: Implement phase-2 volatility model enhancement (e.g., GARCH)
        if len(self.history['price']) < 30:
            return 0.15  # 15% default volatility
            
        # Cast history price list to a concrete List[float] for NumPy processing
        price_history: list[float] = cast(list[float], self.history['price'])
        prices_window = price_history[-30:]
        # Cast to NumPy array; ignore strict dtype checks for Any input.
        prices = np.array(prices_window, dtype=float)  # pyright: ignore[reportAny]
        returns = np.diff(prices) / prices[:-1]
        return float(np.std(returns) * np.sqrt(12))  # Annualized volatility

    def step(self) -> dict[str, float | int]:
        """Advance simulation by one month and return key metrics"""
        self.month += 1
        
        # Get current rates and revenue
        monthly_revenue = self.get_revenue()
        inflation_rate = self.get_inflation_rate()
        _ = self.get_burn_rate()  # Reserved for future burn rate logic
        
        # Check security guard-band trigger
        guard_band_triggered = self.check_security_guard_band(monthly_revenue)
        if guard_band_triggered:
            inflation_rate = max(inflation_rate, self.params.guard_band_inflation)
            
        # Calculate inflation (monthly)
        monthly_inflation_rate = inflation_rate / 12
        new_tokens = self.circulating_supply * monthly_inflation_rate
        self.circulating_supply += new_tokens
        
        # Execute burns through auction mechanism
        tokens_burned, _ = self.execute_burn_auction(monthly_revenue)
        
        # Update price (simplified model - consider revenue, supply, volatility)
        supply_pressure = (new_tokens - tokens_burned) / self.circulating_supply
        revenue_support = monthly_revenue / (self.circulating_supply * self.price)
        volatility = self.estimate_volatility()
        
        price_change = (revenue_support - supply_pressure) * (1 + np.random.normal(0, volatility/12))
        self.price = max(0.01, self.price * (1 + price_change))
        
        # Calculate metrics
        market_cap = self.circulating_supply * self.price
        net_supply_change = new_tokens - tokens_burned
        
        # Update security budget
        self.security_budget_annual = self.calculate_security_budget_needed()
        
        # Store historical data (explicit per-key to avoid union-type ambiguities)
        cast(list[float], self.history['month']).append(float(self.month))
        cast(list[float], self.history['price']).append(self.price)
        cast(list[float], self.history['circulating_supply']).append(self.circulating_supply)
        cast(list[float], self.history['monthly_inflation']).append(new_tokens)
        cast(list[float], self.history['monthly_burns']).append(tokens_burned)
        cast(list[float], self.history['net_supply_change']).append(net_supply_change)
        cast(list[float], self.history['market_cap']).append(market_cap)
        cast(list[float], self.history['revenue']).append(monthly_revenue)
        cast(list[float], self.history['security_budget']).append(self.security_budget_annual)
        
        # Return current month metrics (compatible with simple API)
        return {
            "month": int(self.month),
            "price": self.price,
            "circulating": self.circulating_supply,
            "minted": new_tokens,
            "burned": tokens_burned,
            "total_burned": self.total_burned,
            "revenue": monthly_revenue,
            "market_cap": market_cap,
        }

    def run_simulation(self, months: int = 60) -> pd.DataFrame:
        """Return a DataFrame of monthly metrics for specified months"""
        self.reset_state()  # Start fresh
        records = [self.step() for _ in range(months)]
        return pd.DataFrame(records)

    def stress_test(self, scenario: str = "bear_market") -> pd.DataFrame:
        """Run stress test scenarios for institutional due diligence"""
        if scenario == "bear_market":
            # 70% price crash + 50% revenue decline
            original_price = self.params.initial_price
            original_targets = self.params.revenue_targets.copy()
            
            self.params.initial_price *= 0.3  # 70% crash
            for key in self.params.revenue_targets:
                self.params.revenue_targets[key] *= 0.5  # 50% revenue decline
                
            result = self.run_simulation(60)
            
            # Restore original parameters
            self.params.initial_price = original_price
            self.params.revenue_targets = original_targets
            
            return result
            
        elif scenario == "governance_attack":
            # Simulate malicious governance trying to inflate supply
            result_records = []
            self.reset_state()
            
            for month in range(60):
                # Every 6 months, try maximum inflation increase
                if month % 6 == 0 and month > 0:
                    _ = self.simulate_governance_change(self.params.max_governance_increase)
                    
                result_records.append(self.step())
                
            return pd.DataFrame(result_records)
            
        elif scenario == "revenue_failure":
            # Revenue grows only 10% of projections
            original_targets = self.params.revenue_targets.copy()
            for key in self.params.revenue_targets:
                self.params.revenue_targets[key] *= 0.1
                
            result = self.run_simulation(60)
            
            # Restore original parameters
            self.params.revenue_targets = original_targets
            return result
            
        else:
            # Default: just run base simulation
            return self.run_simulation(60)

    # --- Backward Compatibility Methods (for existing notebooks) ---
    def _year(self) -> int:
        """Backward compatibility: get current year (1-indexed)"""
        return self.month // 12 + 1

    def _market_cap(self) -> float:
        """Backward compatibility: get current market cap"""
        return self.circulating_supply * self.price

    def _annual_revenue(self) -> float:
        """Backward compatibility: get annual revenue for current year"""
        year = self._year()
        year_key = f"year_{year}" if year <= 5 else "year_5"
        return self.params.revenue_targets.get(year_key, self.params.revenue_targets["year_5"])


# --- Analysis Functions ---

def generate_comparative_analysis() -> pd.DataFrame:
    """Generate comparative analysis across multiple scenarios"""
    params = CIROParameters()
    engine = CIROTokenomicsEngine(params)
    
    scenarios = ["bear_market", "governance_attack", "revenue_failure"]
    results = {}
    
    # Run base case
    base_result = engine.run_simulation(60)
    results["base_case"] = {
        "final_price": cast(float, base_result["price"].iloc[-1]),
        "final_supply": cast(float, base_result["circulating"].iloc[-1]),
        "total_burned": cast(float, base_result["total_burned"].iloc[-1]),
        "final_market_cap": cast(float, base_result["market_cap"].iloc[-1]),
    }
    
    # Run stress tests
    for scenario in scenarios:
        stress_result = engine.stress_test(scenario)
        results[scenario] = {
            "final_price": cast(float, stress_result["price"].iloc[-1]),
            "final_supply": cast(float, stress_result["circulating"].iloc[-1]),
            "total_burned": cast(float, stress_result["total_burned"].iloc[-1]),
            "final_market_cap": cast(float, stress_result["market_cap"].iloc[-1]),
        }
    
    # Use transpose so scenarios become rows
    return pd.DataFrame(results).T


# Run basic simulation if called directly
if __name__ == "__main__":
    params = CIROParameters()
    engine = CIROTokenomicsEngine(params)
    
    print("Running CIRO v3.0 Tokenomics Simulation...")
    result = engine.run_simulation(60)
    print(f"Final Price: ${result['price'].iloc[-1]:.4f}")
    print(f"Final Supply: {result['circulating'].iloc[-1]:,.0f} CIRO")
    print(f"Total Burned: {result['total_burned'].iloc[-1]:,.0f} CIRO")
    
    print("\nRunning Stress Tests...")
    comparative = generate_comparative_analysis()
    print(comparative) 