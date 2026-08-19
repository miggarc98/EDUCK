from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.behavior.api.views import (
    BehaviorRuleViewSet,
    IncidentReportViewSet,
    IncidentInvolvementViewSet,
    DisciplinaryActionViewSet
)

router = DefaultRouter()
router.register('rules', BehaviorRuleViewSet, basename='behavior-rules')
router.register('incidents', IncidentReportViewSet, basename='incidents')
router.register('involvements', IncidentInvolvementViewSet, basename='involvements')
router.register('actions', DisciplinaryActionViewSet, basename='actions')

urlpatterns = [
    path('', include(router.urls)),
]
