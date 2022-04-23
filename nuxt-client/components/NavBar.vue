<template>
	<div class="w3-bar gdc-color-tonic gdc-display-flex">
		<!-- Mobile Button -->
		<a
			class="w3-bar-item w3-button w3-left w3-hide-large w3-hide-medium"
			@click.prevent="showMenu = !showMenu"
		>
			&#9776;
		</a>
		<NuxtLink class="w3-bar-item w3-button" to="/"> GDC Toolbox </NuxtLink>
		<div class="w3-dropdown-hover gdc-color-tonic">
			<!-- Desktop Menu -->
			<button class="w3-button w3-hide-small">Missions</button>
			<div class="w3-dropdown-content w3-bar-block w3-card gdc-color-tonic">
				<NuxtLink
					v-for="(link, i) of links"
					:key="i"
					class="w3-bar-item w3-button"
					:to="link.to"
				>
					{{ link.label }}
				</NuxtLink>
			</div>
		</div>
		<AuthBar />
	</div>
	<div
		v-if="showMenu"
		class="w3-bar-block w3-hide-large w3-hide-medium gdc-color-tonic"
	>
		<!-- Mobile Menu -->
		<NuxtLink
			v-for="(link, i) of links"
			:key="i"
			class="w3-bar-item w3-button"
			:to="link.to"
		>
			{{ link.label }}
		</NuxtLink>
		<AuthBar />
	</div>
</template>

<script setup>
const links = [
	{ label: "Liste des missions", to: "/mission/" },
	{ label: "Publier une mission", to: "/mission/publish/" },
];

const showMenu = ref(false);
</script>
