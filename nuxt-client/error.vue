<template>
	<NuxtLayout name="default" header="Oops">
		{{ props.error.message }}
		<button @click="handleError">Clear errors</button>
	</NuxtLayout>
</template>

<script lang="ts" setup>
import background from "@/assets/img/backgrounds/error.jpg";

const runtimeConfig = useRuntimeConfig();

const props = defineProps({
	error: Object,
});

const handleError = () => clearError({ redirect: "/" });

// Defining meta tags
useHead(() => ({
	title: `${props.error.statusCode} | ${runtimeConfig.public.BASE_TITLE}`,
	bodyAttrs: {
		style: `background-image: url('${background}');`,
	},
}));
</script>
