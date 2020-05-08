from django.contrib import admin

# Register your models here.
from apps.wfusers.models import WfUser

admin.site.register(WfUser)
