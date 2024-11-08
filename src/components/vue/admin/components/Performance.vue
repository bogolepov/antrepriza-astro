<script setup lang="ts">
import { inject, ref, computed, watch } from 'vue';
import { EAuthRole } from '@scripts/auth';
import { type TPerformance, EPerformanceType } from '@scripts/db/baseTypes';

interface Props {
	performance: TPerformance;
	listPlays;
	listStages;
}
const { performance, listPlays, listStages } = defineProps<Props>();
const emit = defineEmits(['checkPerformancesChanging', 'deletePerformance']);

const authRole: EAuthRole = inject('authRole');
const isDemo = computed(() => authRole.value === EAuthRole.DEMO);

const showCard = ref(false);
const editCard = ref(false);

// const minDate = ref(new Date().toISOString().split('T')[0]);
const minDate = ref('2024-01-01');

const listYesNo = ref([
	{ text: 'нет', value: false },
	{ text: 'да', value: true },
]);

function modifyPerformance() {
	const wasEditMode = editCard.value;
	editCard.value = !editCard.value;
	if (wasEditMode) {
		emit('checkPerformancesChanging');
	}
}
function deletePerformance() {
	emit('deletePerformance', performance.id);
}

const stageName = computed(() => {
	let stage = listStages.find(stage => stage.value === performance.stage_sid);
	if (stage) return stage.text;
	else return '-';
});
const playName = computed(() => {
	let play = listPlays.find(play => play.value === performance.play_sid);
	if (play) return play.text;
	else return '-';
});
const performanceTitle = computed(() => {
	return `${playName.value} [${performance.date} ${performance.time}]`;
});

watch(
	() => [performance.stage_sid, performance.date, performance.time],
	() => {
		performance.sid = `${performance.stage_sid}_${performance.date.replace(/[^0-9]/g, '')}_${performance.time.replace(/[^0-9]/g, '')}`;
	}
);
// watch(
// 	() => [performance.play_sid, performance.date, performance.time],
// 	() => {
// 		return `${playName} [${performance.date} ${performance.time}]`;
// 	}
// );
</script>

<template>
	<div class="item-title" @click="showCard = !showCard">
		<h3>
			<span class="item-title-date">[{{ performance.date }} {{ performance.time }}]</span>
			{{ playName }}
		</h3>
		<div class="item-title-actions">
			<button class="expand-item-button">
				{{ showCard ? '➖' : '➕' }}
			</button>
		</div>
	</div>
	<ul v-show="showCard" class="item-card">
		<li>
			<div class="label">Спектакль:</div>
			<div v-if="!editCard">{{ playName }}</div>
			<select v-else v-model="performance.play_sid" class="list-select">
				<option v-for="option in listPlays" :value="option.value">
					{{ option.text }}
				</option>
			</select>
		</li>
		<li>
			<div class="label">Дата:</div>
			<div v-if="!editCard">{{ performance.date ? performance.date : ' - ' }}</div>
			<input
				v-else
				type="date"
				:value="performance.date"
				@change="
					event => {
						performance.date = event.target.value;
					}
				"
				:min="minDate"
			/>
		</li>
		<li>
			<div class="label">Время:</div>
			<div v-if="!editCard">{{ performance.time ? performance.time : ' - ' }}</div>
			<input
				v-else
				type="time"
				:value="performance.time"
				@change="
					event => {
						performance.time = event.target.value;
					}
				"
			/>
		</li>
		<li>
			<div class="label">Площадка:</div>
			<div v-if="!editCard">{{ stageName }}</div>
			<select v-else v-model="performance.stage_sid" class="list-select">
				<option v-for="option in listStages" :value="option.value">
					{{ option.text }}
				</option>
			</select>
		</li>
		<li>
			<div class="label">Премьера:</div>
			<div v-if="!editCard">{{ performance.premiere ? 'да' : 'нет' }}</div>
			<select v-else v-model="performance.premiere" class="list-select">
				<option v-for="option in listYesNo" :value="option.value">
					{{ option.text }}
				</option>
			</select>
		</li>
		<li>
			<div class="label">Тип выступления:</div>
			<div v-if="!editCard">{{ performance.event_type }}</div>
			<select v-else v-model="performance.event_type" class="list-select">
				<option v-for="option in Object.values(EPerformanceType)" :value="option">
					{{ option }}
				</option>
			</select>
		</li>
		<li>
			<div class="label">Текстовый идентификатор:</div>
			<div v-if="!editCard">{{ performance.sid ? performance.sid : ' - ' }}</div>
			<input v-else type="text" v-model="performance.sid" disabled />
		</li>
		<li class="modify-item">
			<button @click="modifyPerformance" :disabled="isDemo">{{ editCard ? 'OK' : 'Редактировать' }}</button>
			<button @click="deletePerformance" :disabled="isDemo">Удалить</button>
		</li>
	</ul>
</template>

<style>
.item-title-date {
	color: var(--colorFontDate);
}
</style>
