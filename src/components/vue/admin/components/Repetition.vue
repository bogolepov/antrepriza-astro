<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { isDemo } from '../statesStore';
import { type TRepetition, ERepetitionType, type TSubRepetition } from '@scripts/db/baseTypes';

interface Props {
	repetition: TRepetition;
	listPlays;
	listStages;
}
const { repetition, listPlays, listStages } = defineProps<Props>();
const emit = defineEmits(['checkRepetitionsChanging', 'deleteRepetition']);
// , 'addSubRepetition', 'deleteSubRepetition'

const showCard = ref(false);
const editCard = ref(false);

const minDate = ref(new Date().toISOString().split('T')[0]);
// const minDate = ref('2024-01-01');

function modifyRepetition() {
	const wasEditMode = editCard.value;
	editCard.value = !editCard.value;
	if (wasEditMode) {
		emit('checkRepetitionsChanging');
	}
}
function deleteRepetition() {
	emit('deleteRepetition', repetition.id);
}

const stageName = computed(() => {
	let stage = listStages.find(stage => stage.value === repetition.stage_sid);
	if (stage) return stage.text;
	else return '-';
});

const playNames = computed(() => {
	let names: string = '';
	let plays: string[] = [];
	repetition.subRepetitions.forEach(item => {
		if (item.event_type != ERepetitionType.WORKSHOP && item.play_sid != '') {
			let play = listPlays.find(play => play.value === item.play_sid);
			if (play) plays.push(play.text);
		}
	});
	names = plays.join(', ');
	if (names.length > 0) names = names + '.';
	return names;
	// let play = listPlays.find(play => play.value === repetition.play_sid);
	// if (play) return play.text;
	// else return '-';
});

function getPlayName(play_sid: string) {
	let play = listPlays.find(play => play.value === play_sid);
	if (play) return play.text;
	else return '-';
}

function addSubRepetition() {
	let subRepetition: TSubRepetition = { play_sid: '', event_type: ERepetitionType.NORMAL };
	repetition.subRepetitions.push(subRepetition);
}
function deleteSubRepetition(index) {
	repetition.subRepetitions.splice(index, 1);
}

watch(
	() => [repetition.stage_sid, repetition.date, repetition.time_start],
	() => {
		repetition.sid = `${repetition.stage_sid}_${repetition.date.replace(/[^0-9]/g, '')}_${repetition.time_start.replace(
			/[^0-9]/g,
			''
		)}_rep`;
	}
);
</script>

<template>
	<div class="item-title" @click="showCard = !showCard">
		<h3>
			<span class="item-title-date">[{{ repetition.date }} {{ repetition.time_start }}]</span>
			🛠️ {{ playNames }} {{ stageName }}
		</h3>
		<div class="item-title-actions">
			<button class="expand-item-button">
				{{ showCard ? '➖' : '➕' }}
			</button>
		</div>
	</div>
	<ul v-show="showCard" class="item-card">
		<li>
			<div class="label">Дата:</div>
			<div v-if="!editCard">{{ repetition.date ? repetition.date : ' - ' }}</div>
			<input
				v-else
				type="date"
				:value="repetition.date"
				@change="
					event => {
						repetition.date = event.target.value;
					}
				"
				:min="minDate"
			/>
		</li>
		<li>
			<div class="label">Время:</div>
			<div v-if="!editCard">{{ repetition.time_start ? repetition.time_start + ' - ' + repetition.time_end : ' - ' }}</div>
			<div v-else class="repetition-time-edit">
				<input
					type="time"
					:value="repetition.time_start"
					@change="
						event => {
							repetition.time_start = event.target.value;
						}
					"
				/>
				<span class="time-from-to">-</span>
				<input
					type="time"
					:value="repetition.time_end"
					@change="
						event => {
							repetition.time_end = event.target.value;
						}
					"
				/>
			</div>
		</li>
		<li>
			<div class="label">Площадка:</div>
			<div v-if="!editCard">{{ stageName }}</div>
			<select v-else v-model="repetition.stage_sid" class="list-select">
				<option disabled value="">Выбрать:</option>
				<option v-for="option in listStages" :value="option.value">
					{{ option.text }}
				</option>
			</select>
		</li>
		<li>
			<div class="label" style="width: 100%">
				Задачи:
				<button v-show="editCard && repetition.subRepetitions.length < 3" class="modify-subrepetition" @click="addSubRepetition">+</button>
			</div>
			<ul class="subrepeptitions-list">
				<template v-for="(subRepetition, index) of repetition.subRepetitions" :key="subRepetition.play_sid">
					<li>
						<template v-if="!editCard">
							<div>{{ subRepetition.event_type }}{{ subRepetition.event_type === ERepetitionType.WORKSHOP ? '' : ':' }}</div>
							<div v-show="subRepetition.event_type !== ERepetitionType.WORKSHOP">{{ getPlayName(subRepetition.play_sid) }}</div>
						</template>
						<template v-else>
							<select v-model="subRepetition.event_type" class="list-select">
								<option disabled value="">Выбрать:</option>
								<option v-for="option in Object.values(ERepetitionType)" :value="option">
									{{ option }}
								</option>
							</select>
							<select
								:disabled="subRepetition.event_type === ERepetitionType.WORKSHOP"
								v-model="subRepetition.play_sid"
								class="list-select"
							>
								<option disabled value="">Выбрать спектакль:</option>
								<option v-for="option of listPlays" :value="option.value">
									{{ option.text }}
								</option>
							</select>
							<button v-show="repetition.subRepetitions.length > 1" class="modify-subrepetition" @click="deleteSubRepetition(index)">
								-
							</button>
						</template>
					</li>
				</template>
			</ul>
		</li>
		<li class="modify-item">
			<button @click="modifyRepetition" :disabled="isDemo">{{ editCard ? 'OK' : 'Редактировать' }}</button>
			<button @click="deleteRepetition()" :disabled="isDemo">Удалить</button>
		</li>
	</ul>
</template>

<style>
.item-title-date {
	color: var(--colorFontDate);
}
.time-from-to {
	padding: 0 0.8rem;
}
.repetition-time-edit * {
	line-height: 1rem;
	margin-bottom: 0.4rem;
}
.subrepeptitions-list li {
	display: flex;
	flex-direction: row;
	row-gap: 0;
	/* column-gap: 1rem; */
	flex-wrap: wrap;
	flex-grow: 1;
	position: relative;
}
.subrepeptitions-list li::before {
	content: '▫️';
	/* 💠 */
	position: absolute;
	top: 0;
	left: -0.1rem;
}
.subrepeptitions-list li > * {
	margin-left: 1rem;
}
.subrepeptitions-list select {
	margin-bottom: 0.4rem;
}
.subrepeptitions-list select[disabled] {
	visibility: hidden;
}
.modify-subrepetition {
	line-height: 1.1rem;
	background-color: transparent;
	padding: 0 0.4rem;
	margin-top: 0;
	margin-left: 1rem;
	margin-bottom: 0.6rem;
	border: 1px solid var(--colorFont);
}
</style>
