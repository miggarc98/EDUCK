# Generated manually

from django.db import migrations
from django.contrib.postgres.operations import CryptoExtension

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        CryptoExtension(),
    ]
