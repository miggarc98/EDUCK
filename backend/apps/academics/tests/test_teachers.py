from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django_tenants.test.cases import TenantTestCase
from apps.auth_users.models import User, UserRole
from apps.academics.models import TeacherProfile

class TeacherProfileAndAPITests(TenantTestCase):
    def setUp(self):
        super().setUp()
        self.client = APIClient()
        self.client.defaults['HTTP_HOST'] = self.tenant.domains.first().domain

        self.admin = User.objects.create_user(
            email='admin@educk.com',
            password='password123',
            first_name='Admin',
            last_name='User',
            role=UserRole.ADMIN
        )

        self.teacher_user = User.objects.create_user(
            email='teacher1@educk.com',
            password='password123',
            first_name='Carmen',
            last_name='Ramírez',
            role=UserRole.TEACHER
        )
        self.profile = TeacherProfile.objects.create(
            user=self.teacher_user,
            area='Matemáticas',
            academic_load=24,
            status='active'
        )

        self.list_url = reverse('teachers-list')
        self.detail_url = reverse('teachers-detail', args=[self.teacher_user.id])

    def test_teacher_id_auto_generation(self):
        # The first profile got DOC-001 automatically if not set, or we can check custom save logic:
        p1 = TeacherProfile.objects.get(id=self.profile.id)
        self.assertEqual(p1.employee_id, 'DOC-001')

        # Creating another profile should result in DOC-002
        teacher_user2 = User.objects.create_user(
            email='teacher2@educk.com',
            password='password123',
            role=UserRole.TEACHER
        )
        p2 = TeacherProfile.objects.create(
            user=teacher_user2,
            area='Ciencias',
            academic_load=20
        )
        self.assertEqual(p2.employee_id, 'DOC-002')

    def test_unauthenticated_cannot_access_api(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_can_list_teachers(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data
        # If paginated or list, let's see: viewset default may or may not be paginated
        # TeacherViewSet uses standard configuration without explicit pagination class,
        # but let's handle list response:
        teachers = results.get('results') if isinstance(results, dict) else results
        self.assertEqual(len(teachers), 1)
        self.assertEqual(teachers[0]['email'], 'teacher1@educk.com')
        self.assertEqual(teachers[0]['area'], 'Matemáticas')
        self.assertEqual(teachers[0]['load'], 24)
        self.assertEqual(teachers[0]['status'], 'active')

    def test_create_teacher_via_api(self):
        self.client.force_authenticate(user=self.admin)
        payload = {
            'email': 'new_teacher@educk.com',
            'first_name': 'Jorge',
            'last_name': 'Pérez',
            'area': 'Educación Física',
            'load': 18,
            'status': 'active'
        }
        response = self.client.post(self.list_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['employee_id'], 'DOC-002')

        # Verify database record
        new_user = User.objects.get(email='new_teacher@educk.com')
        self.assertEqual(new_user.role, UserRole.TEACHER)
        self.assertEqual(new_user.teacher_profile.area, 'Educación Física')
        self.assertEqual(new_user.teacher_profile.academic_load, 18)

    def test_update_teacher_via_api(self):
        self.client.force_authenticate(user=self.admin)
        payload = {
            'first_name': 'Carmen Alicia',
            'area': 'Cálculo Avanzado',
            'load': 30
        }
        response = self.client.patch(self.detail_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.teacher_user.refresh_from_db()
        self.assertEqual(self.teacher_user.first_name, 'Carmen Alicia')
        self.assertEqual(self.teacher_user.teacher_profile.area, 'Cálculo Avanzado')
        self.assertEqual(self.teacher_user.teacher_profile.academic_load, 30)

    def test_delete_teacher_via_api(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(id=self.teacher_user.id).exists())
