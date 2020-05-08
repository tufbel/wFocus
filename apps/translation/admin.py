from django.contrib import admin

# Register your models here.
from apps.translation.models import Thesaurus

admin.site.register(Thesaurus)
