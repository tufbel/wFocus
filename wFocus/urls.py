"""wFocus URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

from apps.warframes import tests

urlpatterns = [

    path(r'favicon.ico', RedirectView.as_view(url='media/WF_icon_x32.ico')),

    path('admin/', admin.site.urls),
    path('account/', include('apps.wfusers.urls')),

    path('', include('apps.index.urls')),
    path('home/', include('apps.home.urls')),
    path('alerts/', include('apps.alerts.urls')),
    path('warframes/', include('apps.warframes.urls')),
    path('weapons/', include('apps.weapons.urls')),
    path('mods/', include('apps.mods.urls')),

    path('rivenmygoods/', include('apps.rivenmygoods.urls')),
    path('rivenmarket/', include('apps.rivenmarket.urls')),
    path('msgs/', include('apps.msgs.urls'))

    # 测试url
    # path('test', tests.ajax_test, name='test'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    import debug_toolbar
    urlpatterns.append(
        path('__debug__/', include(debug_toolbar.urls))
    )