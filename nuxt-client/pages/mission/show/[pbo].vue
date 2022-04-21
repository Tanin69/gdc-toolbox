<template>
	<div>{{ title }}</div>
</template>

<script lang="ts" setup>
const route = useRoute();

// Extracting name from PBO (while data is fetching)
const {
	groups: { name },
} = /CPC-.*?-(?<name>.*?)(?:-V\d*)?\./i.exec(route.params.pbo as string);
const title = name.replace(/_/g, " ");

definePageMeta({
	title: "",
	subtitle: "Briefing de mission",
});
</script>
