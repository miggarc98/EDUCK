from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django_tenants.test.cases import TenantTestCase
from apps.auth_users.models import User, UserRole

class UsersListTests(TenantTestCase):
    def setUp(self):
        super().setUp()
        self.client = APIClient()
        # Set HTTP_HOST to the tenant's domain to route the request correctly through django-tenants middleware
        self.client.defaults['HTTP_HOST'] = self.tenant.domains.first().domain

        self.superadmin = User.objects.create_superuser(
            email='super@educk.com',
            password='password123',
            first_name='Super',
            last_name='Admin',
            role=UserRole.SUPERADMIN
        )
        self.admin = User.objects.create_user(
            email='admin@educk.com',
            password='password123',
            first_name='Admin',
            last_name='One',
            role=UserRole.ADMIN
        )
        self.teacher = User.objects.create_user(
            email='teacher@educk.com',
            password='password123',
            first_name='Teacher',
            last_name='One',
            role=UserRole.TEACHER
        )
        self.student = User.objects.create_user(
            email='student@educk.com',
            password='password123',
            first_name='Student',
            last_name='One',
            role=UserRole.STUDENT
        )
        self.url = reverse('users_list')

    def test_unauthenticated_cannot_access(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_non_admin_cannot_access(self):
        self.client.force_authenticate(user=self.teacher)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.student)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_access_and_excludes_superadmin(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        results = response.data['results']
        emails = [u['email'] for u in results]
        self.assertNotIn('super@educk.com', emails)
        self.assertIn('admin@educk.com', emails)
        self.assertIn('teacher@educk.com', emails)
        self.assertIn('student@educk.com', emails)
        self.assertEqual(len(emails), 3)

    def test_superadmin_can_access_and_excludes_superadmin(self):
        self.client.force_authenticate(user=self.superadmin)
        response = self.client.get(self.url)
        # Note: Under pagination, the results list is inside the 'results' field!
        # Wait, since our mock test database has 4 users total, it will not paginate yet (page size is 10),
        # but the keys will be 'count', 'next', 'previous', 'results'!
        # Let's verify the response structure contains results
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        emails = [u['email'] for u in results]
        self.assertNotIn('super@educk.com', emails)
        self.assertEqual(len(emails), 3)

    def test_admin_can_update_user(self):
        self.client.force_authenticate(user=self.admin)
        update_url = reverse('user_update', kwargs={'pk': self.student.id})
        data = {
            'first_name': 'UpdatedStudentName',
            'last_name': 'UpdatedStudentLastName',
            'role': UserRole.TEACHER,
            'is_active': False
        }
        response = self.client.patch(update_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.student.refresh_from_db()
        self.assertEqual(self.student.first_name, 'UpdatedStudentName')
        self.assertEqual(self.student.last_name, 'UpdatedStudentLastName')
        self.assertEqual(self.student.role, UserRole.TEACHER)
        self.assertFalse(self.student.is_active)

    def test_non_admin_cannot_update_user(self):
        self.client.force_authenticate(user=self.teacher)
        update_url = reverse('user_update', kwargs={'pk': self.student.id})
        data = {
            'first_name': 'HackerName'
        }
        response = self.client.patch(update_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_filter_by_name(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.url, {'name': 'Teacher'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['email'], 'teacher@educk.com')

    def test_filter_by_role(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.url, {'role': UserRole.STUDENT})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['email'], 'student@educk.com')
