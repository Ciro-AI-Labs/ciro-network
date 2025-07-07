"""Basic smoke tests for CIRO Tokenomics Engine."""

import pytest  # pyright: ignore[reportUnusedImport]

from src.tokenomics_engine import CIROParameters, CIROTokenomicsEngine


def test_run_simulation_returns_dataframe():
    params = CIROParameters()
    engine = CIROTokenomicsEngine(params)
    df = engine.run_simulation(months=12)

    # Expect 12 rows and key columns
    assert len(df) == 12
    for col in ["price", "circulating", "minted", "burned", "total_burned"]:
        assert col in df.columns

    # Final price should be positive number
    assert df["price"].iloc[-1] > 0 