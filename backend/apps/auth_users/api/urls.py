from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from apps.auth_users.api.views import (
    CustomTokenObtainPairView,
    UserProfileView,
    LogoutView,
    TwoFactorActivateView,
    TwoFactorVerifyView,
)

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('2fa/activate/', TwoFactorActivateView.as_view(), name='2fa_activate'),
    path('2fa/verify/', TwoFactorVerifyView.as_view(), name='2fa_verify'),
]
