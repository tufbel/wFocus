from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django_mysql.models import JSONField
from shortuuidfield import ShortUUIDField


class WfUserManager(BaseUserManager):
    """用户模型管理类"""

    def _create_user(self, email, username, password, **kwargs):
        if not email:
            raise ValueError("请输入邮箱账号!")
        if not username:
            raise ValueError("请输入用户名!")
        if not password:
            raise ValueError("请输入密码!")

        user = self.model(email=email, username=username, **kwargs)
        user.set_password(password)
        user.save()
        return user

    # 创建普通用户
    def create_user(self, email, username, password, **kwargs):
        kwargs['is_superuser'] = False
        return self._create_user(email, username, password, **kwargs)

    # 创建管理员
    def create_superuser(self, email, username, password, **kwargs):
        kwargs['is_superuser'] = True
        kwargs['is_staff'] = True
        return self._create_user(email, username, password, **kwargs)


class WfUser(AbstractBaseUser, PermissionsMixin):
    """用户模型类"""

    # 使用UUID作为用户主键
    uid = ShortUUIDField(primary_key=True)

    # 用户基础信息
    username = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    game_name = models.CharField(max_length=255, null=True)

    data_joined = models.DateTimeField(auto_now_add=True)

    # 默认非员工
    is_staff = models.BooleanField(default=False)
    # 默认用户可用(未删除)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    EMAIL_FIELD = 'email'

    objects = WfUserManager()

    def get_full_name(self):
        return self.username

    def get_short_name(self):
        return self.username

    def __str__(self):
        return '{}:--{}:--{}:-员工-{}'.format(self.username, self.email, self.game_name, self.is_staff)


class WfUserGame(models.Model):
    """用户游戏相关"""
    NO_GAMENAME = 0
    HAVE_GAMENAME = 1
    AUDIT_STATUS = 2
    MANUAL_STATUS = 3

    first_img = models.URLField(
        null=True
    )
    other_imgs = JSONField(
        null=True
    )
    game_status = models.IntegerField(default=NO_GAMENAME)
    wfuser = models.OneToOneField(
        WfUser,
        on_delete=models.CASCADE,
    )