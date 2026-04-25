"""
API — Master Router
Aggregates all v1 route modules.
"""
from fastapi import APIRouter

from api.v1.health import router as health_router
from api.v1.auth import router as auth_router
from api.v1.upload import router as upload_router
from api.v1.institutions import router as institutions_router
from api.v1.departments import router as departments_router
from api.v1.kpis import router as kpis_router
from api.v1.alerts import router as alerts_router
from api.v1.reports import router as reports_router
from api.v1.data_quality import router as data_quality_router
from api.v1.data_catalog import router as data_catalog_router
from api.v1.users import router as users_router
from api.v1.query import router as query_router
from api.v1.websocket import router as ws_router
# New domain endpoints
from api.v1.students import router as students_router
from api.v1.programs import router as programs_router
from api.v1.staff import router as staff_router
from api.v1.partnerships import router as partnerships_router
from api.v1.research import router as research_router
from api.v1.spaces import router as spaces_router
from api.v1.equipment import router as equipment_router
from api.v1.forecasts import router as forecasts_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(upload_router)
api_router.include_router(institutions_router)
api_router.include_router(departments_router)
api_router.include_router(kpis_router)
api_router.include_router(alerts_router)
api_router.include_router(reports_router)
api_router.include_router(data_quality_router)
api_router.include_router(data_catalog_router)
api_router.include_router(users_router)
api_router.include_router(query_router)
api_router.include_router(ws_router)
# New domain routers
api_router.include_router(students_router)
api_router.include_router(programs_router)
api_router.include_router(staff_router)
api_router.include_router(partnerships_router)
api_router.include_router(research_router)
api_router.include_router(spaces_router)
api_router.include_router(equipment_router)
api_router.include_router(forecasts_router)
