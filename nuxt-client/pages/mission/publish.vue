<template>Publish a new mission</template>

<script lang="ts" setup>
import background from "@/assets/img/backgrounds/addMission.jpg";

definePageMeta({
	middleware: ["auth"],
	title: "Publier une mission",
	background,
});
</script>
