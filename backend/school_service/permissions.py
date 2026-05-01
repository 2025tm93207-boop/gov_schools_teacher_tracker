from rest_framework.permissions import BasePermission

class IsHeadmasterOrBEO(BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['headmaster', 'beo']

class IsHeadmaster(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'headmaster'