<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const LS_LETTER_SIZE: string = 'letterSize';
const LETTER_SIZES: Array<string> = ['16px', '19px', '22px'];

const letterSize = ref('');

onMounted(() => {
	const size: string = localStorage.getItem(LS_LETTER_SIZE);
	if (!size) {
		localStorage.setItem(LS_LETTER_SIZE, LETTER_SIZES[0]);
		letterSize.value = LETTER_SIZES[0];
	} else letterSize.value = size;
});

watch(letterSize, newValue => {
	document.documentElement.style.setProperty('--font-size', newValue);
	document.body.style.setProperty('--font-size', newValue);
	localStorage.setItem(LS_LETTER_SIZE, newValue);
});

function changeSize(event: KeyboardEvent, size: string): void {
	if ('Enter' === event.code || 'Space' === event.code) letterSize.value = size;
}
</script>

<template>
	<div>
		<div>Размер шрифта</div>
		<div class="sizes-grid">
			<div
				v-for="size in LETTER_SIZES"
				:class="{ 'size-item': true, current: size === letterSize }"
				:style="{ 'font-size': size }"
				@keypress="changeSize($event, size)"
				tabindex="0"
			>
				<input type="radio" @click="letterSize = size" :id="size" name="letter-sizes" :checked="size === letterSize" tabindex="-1" />
				<label :for="size">A</label>
			</div>
		</div>
	</div>
</template>

<style>
.sizes-grid {
	display: grid;
	grid-template-columns: auto auto auto;
	place-items: center;
	user-select: none;
	max-width: 170px;
}
.size-item {
	display: grid;
	place-items: center;
	cursor: pointer;
	border-radius: 50%;
	border: 1px solid var(--color-border);
	line-height: 1;
	width: 1.6em;
	height: 1.6em;
}
.size-item.current {
	background-color: var(--color-border);
}
.sizes-grid input {
	position: absolute;
	top: -100px;
	opacity: 0;
}
.sizes-grid label {
	cursor: inherit;
}
</style>
