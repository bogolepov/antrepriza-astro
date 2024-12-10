<script setup lang="ts">
import type { TWhatsappNote } from '@scripts/db/baseTypes';
import { EWAItemType, type TWhatsappItem, getStageItemText } from '../lib/whatsapp_types';

interface Props {
	whatsappItem: TWhatsappItem;
	isEdit: boolean;
}
const { whatsappItem, isEdit } = defineProps<Props>();
</script>

<template>
	<div class="wa-stage-item">{{ getStageItemText(whatsappItem) }}</div>
</template>
