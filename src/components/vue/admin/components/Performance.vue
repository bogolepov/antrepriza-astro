<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { isDemo, optionListPlays, optionListStages } from '../store/statesStore';
import { type TPerformance, EPerformanceType } from '@scripts/db/baseTypes';
import { onlyNumbers } from '@netlify/lib/utils';

interface Props {
	performance: TPerformance;
}
const { performance } = defineProps<Props>();

const emit = defineEmits(['checkPerformancesChanging', 'deletePerformance']);

const showCard = ref(false);
const editCard = ref(false);

const minDate = ref(new Date().toISOString().split('T')[0]);
// const minDate = ref('2024-01-01');

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
	let stage = optionListStages.value.find(stage => stage.value === performance.stage_sid);
	if (stage) {
		if (stage.fixed) return 'Сцена ' + stage.text.toUpperCase();
		else return stage.text;
	} else return '-';
});
const playName = computed(() => {
	let play = optionListPlays.value.find(play => play.value === performance.play_sid);
	if (play) return play.text;
	else return '-';
});

watch(
	() => [performance.stage_sid, performance.date, performance.time_start, performance.play_sid],
	() => {
		performance.sid = `${performance.stage_sid}_${onlyNumbers(performance.date)}_${onlyNumbers(performance.time_start)}_${
			performance.play_sid
		}`;
	}
);
watch(
	() => [performance.play_sid, performance.time_start],
	() => {
		let play = optionListPlays.value.find(play => play.value === performance.play_sid);
		let date = new Date('2024-01-01T' + performance.time_start);
		date.setMinutes(date.getMinutes() + play.duration);
		performance.time_end = `${date.getHours()}:${date.getMinutes()}`;
	}
);
</script>

<template>
	<div class="item-title" @click="showCard = !showCard">
		<h3>
			<span class="item-title-date">[{{ performance.date }} {{ performance.time_start }}]</span>
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
				<option disabled value="">Выбрать спектакль:</option>
				<option v-for="option in optionListPlays" :value="option.value">
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
			<div class="label">Время начала:</div>
			<div v-if="!editCard">{{ performance.time_start ? performance.time_start : ' - ' }}</div>
			<input
				v-else
				type="time"
				:value="performance.time_start"
				@change="
					event => {
						performance.time_start = event.target.value;
					}
				"
			/>
		</li>
		<li>
			<div class="label">Площадка:</div>
			<div v-if="!editCard">{{ stageName }}</div>
			<select v-else v-model="performance.stage_sid" class="list-select">
				<option disabled value="">Выбрать площадку:</option>
				<option v-for="option in optionListStages" :value="option.value">
					{{ option.text }}
				</option>
			</select>
		</li>
		<li>
			<div class="label">Тип выступления:</div>
			<div v-if="!editCard">{{ performance.event_type }}</div>
			<select v-else v-model="performance.event_type" class="list-select">
				<option disabled value="">Выбрать:</option>
				<option v-for="option in Object.values(EPerformanceType)" :value="option">
					{{ option }}
				</option>
			</select>
		</li>
		<li>
			<div class="label">Время окончания:</div>
			<div v-if="!editCard">{{ performance.time_end ? performance.time_end : ' - ' }}</div>
			<input v-else type="text" v-model="performance.time_end" disabled />
		</li>
		<!-- <li>
			<div class="label">Текстовый идентификатор:</div>
			<div v-if="!editCard">{{ performance.sid ? performance.sid : ' - ' }}</div>
			<input v-else type="text" v-model="performance.sid" disabled />
		</li> -->
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
