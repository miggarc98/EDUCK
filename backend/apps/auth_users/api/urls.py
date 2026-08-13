from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from apps.auth_users.api.views import CustomTokenObtainPairView, UserProfileView, LogoutView

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
]
