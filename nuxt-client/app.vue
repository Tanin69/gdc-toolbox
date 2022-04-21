<template>
	<NuxtLayout
		name="default"
		:header="route.meta.title || route.meta.subtitle || 'Home'"
	>
		<NuxtPage />
	</NuxtLayout>
</template>

<script lang="ts" setup>
const route = useRoute();
const runtimeConfig = useRuntimeConfig();

useHead(() => ({
	// Defining title template
	titleTemplate: (title) =>
		title
			? `${title} | ${runtimeConfig.public.BASE_TITLE}`
			: runtimeConfig.public.BASE_TITLE,
	// Setting current title (it will follow template)
	title: route.meta.title,
	// Setting background image (`unset` is a fix for client-side navigation)
	bodyAttrs: {
		style:
			"background-image:" +
			(route.meta.background ? `url('${route.meta.background}')` : "unset") +
			";",
	},
}));
</script>
