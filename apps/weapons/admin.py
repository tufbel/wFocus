from django.contrib import admin

# Register your models here.
from apps.weapons.models import Weapon

admin.site.register(Weapon)
