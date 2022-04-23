import { useAuth0 } from "@auth0/auth0-vue";

export default defineNuxtRouteMiddleware((to) => {
	//TODO: useAuth0 may be undefined for unknown resons
	const { isAuthenticated } = useAuth0();
	if (isAuthenticated) {
		return to.fullPath;
	}
	return "/";
});
