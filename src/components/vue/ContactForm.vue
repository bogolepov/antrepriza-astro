<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import dictionary from '@data/dictionary.json';
import theater from '@data/theater.json';
import SendingLoader from './Loader.vue';
import ResultMessageBox from './MessageBox.vue';
import { getEmailAddressError, validEmailAddressFormat } from '@scripts/utils';
import {
	getMessageError,
	isValidContactForm,
	MSG_MAX_LENGTH,
	MSG_MIN_LENGTH,
	sendContactForm,
	validMessage,
} from '@scripts/contact_form';
import type { TContactForm } from '@scripts/types/contactForm';
import { MAX_EMAIL_LENGTH, MIN_EMAIL_LENGTH } from '@scripts/consts';

const sendingLoaderRefName = 'contact-form-loader-ctrl';
type SendingLoaderType = InstanceType<typeof SendingLoader>;
const sendingLoader = useTemplateRef<SendingLoaderType>(sendingLoaderRefName);

const messageBoxRefName = 'contact-form-message-box';
type MessageBoxType = InstanceType<typeof ResultMessageBox>;
const messageBox = useTemplateRef<MessageBoxType>(messageBoxRefName);

interface Props {
	lang: string;
}
const { lang } = defineProps<Props>();

const emit = defineEmits<{
	modalDialogClose?: [];
}>();

const validationMode = ref<boolean>(false);
const formSent = ref<boolean>(false);

const name = ref<string>('');
const emailAddress = ref<string>('');
const subject = ref<string>('');
const topic = ref<string>('');
const message = ref<string>('');
// const acceptedPolicy = ref(true);
// const agreedConnection = ref(true);

const errEmail = ref<string>('');
const errMessage = ref<string>('');

function resetForm() {
	validationMode.value = false;
	name.value = '';
	emailAddress.value = '';
	subject.value = '';
	topic.value = '';
	message.value = '';
	// agreedConnection.value = false;
	// policyComponent.value?.resetPolicy();
}

const buttonValid = computed(() => {
	if (!validationMode.value)
		return (
			// agreedConnection.value &&
			// acceptedPolicy.value &&
			name.value?.trim().length &&
			emailAddress.value?.trim().length &&
			topic.value?.trim().length &&
			message.value?.trim().length
		);
	else return validateFormData() !== undefined;
});

function validateFormData(): TContactForm | undefined {
	const formData: TContactForm = {
		lang: lang,
		name: name.value,
		email: emailAddress.value,
		subject: subject.value,
		topic: topic.value,
		message: message.value,
		now: Date.now(),
	};

	if (isValidContactForm(formData, true)) return formData;

	showFormDataErrors(formData);
	return undefined;
}

function showFormDataErrors(contactForm: TContactForm) {
	errEmail.value = getEmailAddressError(contactForm.email);
	errMessage.value = getMessageError(contactForm.message);
}

function handleSendForm() {
	validationMode.value = true;
	const formData = validateFormData();
	if (formData) {
		sendingLoader.value?.show();
		sendContactForm(formData, handleSendFormResult);
	}
}

function handleSendFormResult(isOk: boolean, msg: string) {
	if (isOk) {
		resetForm();
		formSent.value = true;
	}
	sendingLoader.value?.hide();
	messageBox.value?.show(msg);
}

function closeMessageBox() {
	messageBox.value?.close();
	if (formSent.value) {
		formSent.value = false;
		emit('modalDialogClose');
	}
}
</script>

<template>
	<form method="POST" class="form feedback-form">
		<input type="hidden" v-model="subject" placeholder="Subject" />
		<label class="form-label required font-opacity0" for="topic">{{ dictionary.question_subject[lang] }}</label>
		<div class="select-wrapper">
			<select v-model.trim="topic" class="form-input" required>
				<option disabled value="" selected hidden>{{ dictionary.select_topic[lang] }}</option>
				<option v-for="iBetreff in theater.question_subjects" :value="dictionary[iBetreff][lang]">
					{{ dictionary[iBetreff][lang] }}
				</option>
			</select>
		</div>
		<label class="form-label required font-opacity0" for="qff-name">{{ dictionary.name[lang] }}</label>
		<input
			id="qff-name"
			type="text"
			class="form-input qff"
			v-model.trim="name"
			name="name"
			:placeholder="dictionary.name_hint[lang]"
			autocomplete="on"
			required
		/>
		<div class="form-error" data-for="name"></div>
		<label class="form-label required font-opacity0" for="qff-email">{{ dictionary.email[lang] }}</label>
		<input
			id="qff-email"
			type="email"
			v-model.trim="emailAddress"
			name="email"
			class="form-input qff"
			:minlength="MIN_EMAIL_LENGTH"
			:maxlength="MAX_EMAIL_LENGTH"
			:placeholder="dictionary.email_hint[lang]"
			autocomplete="on"
			required
		/>
		<div v-if="errEmail?.length && !validEmailAddressFormat(emailAddress)" class="form-error">
			{{ dictionary[errEmail][lang] }}
		</div>
		<div class="form-error" data-for="email"></div>
		<label class="form-label required font-opacity0" for="qff-message">{{ dictionary.message[lang] }}</label>
		<textarea
			id="qff-message"
			v-model.trim="message"
			class="form-input qff"
			:placeholder="dictionary.message_hint[lang]"
			:minlength="MSG_MIN_LENGTH"
			:maxlength="MSG_MAX_LENGTH"
			rows="5"
			spellcheck="false"
			autocomplete="on"
			required
		></textarea>
		<div v-if="errMessage?.length && !validMessage(message)" class="form-error">{{ dictionary[errMessage][lang] }}</div>
		<div class="question-btn-wrapper">
			<button type="button" class="pink-button send-form" @click="handleSendForm" :disabled="!buttonValid">
				{{ dictionary.question_btn_send[lang] }}
			</button>
		</div>
	</form>
	<SendingLoader :ref="sendingLoaderRefName" />
	<ResultMessageBox :ref="messageBoxRefName" @handle-close="closeMessageBox" />
</template>

<style>
.pink-button.send-form[disabled] {
	border: 1px solid var(--colorBkgDisabledBtn);
	background-color: var(--colorBkgDisabledBtn);
	color: var(--colorFontDisabledBtn);
	text-decoration: none;
	cursor: default;
}
</style>
