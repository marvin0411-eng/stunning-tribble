# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

`stunning-tribble` is a minimal Python package scaffold (src-layout, setuptools build backend, pytest for testing). The package currently contains a single module (`example.py`) and is intended as a starting point rather than a mature codebase.

## Commands

Install the package in editable mode with dev dependencies:

```bash
pip install -e ".[dev]"
```

Run the full test suite (coverage is enabled by default via `pyproject.toml`):

```bash
pytest
```

Run a single test file or test:

```bash
pytest tests/test_example.py
pytest tests/test_example.py::test_add
```

There is no linter, formatter, or CI configuration in the repository yet.

## Architecture

- **src-layout**: importable code lives under `src/stunning_tribble/`, not at the repo root. `pyproject.toml` (`[tool.setuptools.packages.find]`) points package discovery at `src`.
- **Tests** live in `tests/` and import the package as `stunning_tribble` (e.g. `from stunning_tribble.example import add`), not via relative imports — the package must be installed (`pip install -e .`) for this to work.
- **pytest config** (`[tool.pytest.ini_options]` in `pyproject.toml`) sets `testpaths = ["tests"]` and always runs with `--cov=stunning_tribble --cov-report=term-missing`, so `pytest` alone reports coverage for the `stunning_tribble` package (scoped via `[tool.coverage.run]`).
