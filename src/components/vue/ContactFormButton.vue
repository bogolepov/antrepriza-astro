<script setup lang="ts">
import { useTemplateRef } from 'vue';
import ContactForm from './ContactForm.vue';
import ModalDialog from './ModalDialog.vue';

interface Props {
	text: string;
	btnClass?: string;
	lang: string;
}
const { text, btnClass = 'contact-form-button' } = defineProps<Props>();

const modalDialogRefName = 'modal-dialog-ctrl';
type ModalDialogType = InstanceType<typeof ModalDialog>;
const modalDialog = useTemplateRef<ModalDialogType>(modalDialogRefName);

function closeModalDialog() {
	modalDialog.value.close();
}
</script>

<template>
	<button @click="modalDialog.open()" :class="btnClass">{{ text }}</button>
	<ModalDialog :ref="modalDialogRefName">
		<ContactForm :lang @modal-dialog-close="closeModalDialog" />
	</ModalDialog>
</template>

<style>
.contact-form-button {
	display: inline-block;
	position: relative;
	color: var(--colorFontDate);
	letter-spacing: 0.02em;
	text-transform: uppercase;
	font-weight: 400;
	cursor: pointer;
	border: none;
	background-color: transparent;
	font-size: clamp(0.8rem, 2vw, 0.95rem);
	padding: 0;
	margin-bottom: 0.4em;
}
.contact-form-button:focus-visible {
	outline: 1px solid var(--colorAntreprizaRed);
}
</style>
