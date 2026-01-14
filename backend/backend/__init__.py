"""
Project package init.

This project historically used PyMySQL to emulate MySQLdb. In production (Render),
we often use Postgres via DATABASE_URL, so PyMySQL may not be installed.
Make this optional to avoid crashing on import.
"""

try:
    import pymysql  # type: ignore

    pymysql.version_info = (2, 2, 1, "final", 0)
    pymysql.install_as_MySQLdb()
except ModuleNotFoundError:
    # OK when not using MySQL/PyMySQL (e.g. Postgres on Render)
    pass
