"""
UCAR Intelligence Hub — ORM Models Package
"""

from models.institution import Institution
from models.department import Department
from models.time_dim import TimeDimension
from models.domain import Domain
from models.metric import Metric
from models.fact_kpi import FactKPI
from models.alert import Alert
from models.report import Report
from models.report_template import ReportTemplate
from models.user import User
from models.nl_query_log import NLQueryLog
from models.upload_log import UploadLog
from models.data_catalog import DataCatalog

# Domain Dimensions
from models.student import Student
from models.program import Program
from models.staff import Staff
from models.partnership import Partnership
from models.research_project import ResearchProject
from models.space import Space
from models.equipment import Equipment
from models.inventory_item import InventoryItem
from models.student_activity import StudentActivity
from models.training_program import TrainingProgram

# Operational
from models.event_queue import EventQueue
from models.audit_log import AuditLog

__all__ = [
    # Core Dimensions
    "Institution",
    "Department",
    "TimeDimension",
    "Domain",
    "Metric",
    # Fact Tables
    "FactKPI",
    # Intelligence & Quality
    "Alert",
    "DataCatalog",
    "UploadLog",
    "NLQueryLog",
    # Domain Dimensions
    "Student",
    "Program",
    "Staff",
    "Partnership",
    "ResearchProject",
    "Space",
    "Equipment",
    "InventoryItem",
    "StudentActivity",
    "TrainingProgram",
    # Operational
    "Report",
    "ReportTemplate",
    "User",
    "EventQueue",
    "AuditLog",
]
