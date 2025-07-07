# SPDX-License-Identifier: BUSL-1.1
# Copyright (c) 2025 CIRO Network Foundation
#
# This file is part of CIRO Network.
#
# Licensed under the Business Source License 1.1 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at:
#     https://github.com/Ciro-AI-Labs/ciro-network/blob/main/LICENSE-BSL
#
# Change Date: January 1, 2029
# Change License: Apache License, Version 2.0
#
# For more information see: https://github.com/Ciro-AI-Labs/ciro-network/blob/main/WHY_BSL_FOR_CIRO.md

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