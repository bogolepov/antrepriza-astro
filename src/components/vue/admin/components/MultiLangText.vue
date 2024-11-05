<script setup lang="ts">
import { LANG_LIST } from '@scripts/consts';
import type { TMultiText } from '@scripts/db/baseTypes';
import { computed } from 'vue';

interface Props {
	multiText: TMultiText;
	isEdit: boolean;
}

const { multiText, isEdit } = defineProps<Props>();
function showText(text) {
	if (text === undefined || text.trim().length === 0) return ' - ';
	else return text;
}
</script>

<template>
	<ul class="multi-flex">
		<template v-for="lang in LANG_LIST">
			<li v-if="!isEdit" class="multi-view">{{ showText(multiText[lang]) }}</li>
			<li v-else class="multi-edit"><input type="text" v-model="multiText[lang]" :placeholder="lang" /></li>
		</template>
	</ul>
</template>

<style>
.multi-flex {
	display: flex;
	flex-direction: row;
	row-gap: 0;
	flex-wrap: wrap;
	flex-grow: 1;
}

.multi-flex li:has(+ li)::after {
	content: '/';
	padding: 0 0.5rem;
}
.multi-flex input {
	line-height: 1;
	margin-bottom: 0.4rem;
}
</style>
