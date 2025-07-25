<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { isDemo, optionListPlays, optionListStages } from '../lib/statesStore';
import { type TRepetition, ERepetitionType, type TSubRepetition } from '@scripts/db/baseTypes';
import { onlyNumbers } from '@scripts/utils';

interface Props {
	repetition: TRepetition;
}
const { repetition } = defineProps<Props>();
const emit = defineEmits(['checkRepetitionsChanging', 'deleteRepetition']);

const showCard = ref(false);
const editCard = ref(false);
const proxyRepetition = ref<TRepetition>();

const minDate = ref(new Date().toISOString().split('T')[0]);
// const minDate = ref('2024-01-01');

function modifyRepetition() {
	if (editCard.value) {
		Object.assign(repetition, proxyRepetition.value);
		emit('checkRepetitionsChanging');
		proxyRepetition.value = null;
	} else {
		proxyRepetition.value = JSON.parse(JSON.stringify(repetition));
	}
	editCard.value = !editCard.value;
}
function cancelModifyRepetition() {
	proxyRepetition.value = null;
	editCard.value = false;
}
function deleteRepetition() {
	proxyRepetition.value = null;
	emit('deleteRepetition', repetition.id);
}

const stageName = computed(() => {
	let stage = optionListStages.value.find(stage => stage.value === repetition.stage_sid);
	if (stage) {
		if (stage.fixed) return 'Сцена ' + stage.text.toUpperCase();
		else return stage.text;
	} else return '-';
});

const playNames = computed(() => {
	let names: string = '';
	let plays: string[] = [];
	repetition.subRepetitions.forEach(item => {
		if (item.event_type != ERepetitionType.WORKSHOP && item.play_sid != '') {
			let play = optionListPlays.value.find(play => play.value === item.play_sid);
			if (play) plays.push(play.text);
		}
	});
	names = plays.join(', ');
	if (names.length > 0) names = names + '.';
	return names;
});

function getPlayName(play_sid: string) {
	let play = optionListPlays.value.find(play => play.value === play_sid);
	if (play) return play.text;
	else return '-';
}

function addSubRepetition() {
	let subRepetition: TSubRepetition = { play_sid: '', event_type: ERepetitionType.NORMAL };
	proxyRepetition.value.subRepetitions.push(subRepetition);
}
function deleteSubRepetition(index) {
	proxyRepetition.value.subRepetitions.splice(index, 1);
}

watch(
	() => [repetition.stage_sid, repetition.date, repetition.time_start],
	() => {
		repetition.sid = `${repetition.stage_sid}_${onlyNumbers(repetition.date)}_${onlyNumbers(repetition.time_start)}_rep`;
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
				:value="proxyRepetition.date"
				@change="
					event => {
						proxyRepetition.date = (event.target as HTMLInputElement).value;
					}
				"
				:min="minDate"
			/>
		</li>
		<li>
			<div class="label">Время:</div>
			<div v-if="!editCard">
				{{ repetition.time_start ? repetition.time_start + ' - ' + repetition.time_end : ' - ' }}
			</div>
			<div v-else class="repetition-time-edit">
				<input
					type="time"
					:value="proxyRepetition.time_start"
					@change="
						event => {
							proxyRepetition.time_start = (event.target as HTMLInputElement).value;
						}
					"
				/>
				<span class="time-from-to">-</span>
				<input
					type="time"
					:value="proxyRepetition.time_end"
					@change="
						event => {
							proxyRepetition.time_end = (event.target as HTMLInputElement).value;
						}
					"
				/>
			</div>
		</li>
		<li>
			<div class="label">Площадка:</div>
			<div v-if="!editCard">{{ stageName }}</div>
			<select v-else v-model="proxyRepetition.stage_sid" class="list-select">
				<option disabled value="">Выбрать:</option>
				<option v-for="option in optionListStages" :value="option.value">
					{{ option.text }}
				</option>
			</select>
		</li>
		<li>
			<div class="label" style="width: 100%">
				Задачи:
				<button
					v-show="editCard && proxyRepetition.subRepetitions.length < 3"
					class="modify-subrepetition"
					@click="addSubRepetition"
				>
					+
				</button>
			</div>
			<ul class="subrepeptitions-list">
				<template v-if="!editCard">
					<template v-for="(subRepetition, index) in repetition.subRepetitions" :key="subRepetition.play_sid">
						<li>
							<div>
								{{ subRepetition.event_type }}{{ subRepetition.event_type === ERepetitionType.WORKSHOP ? '' : ':' }}
							</div>
							<div v-show="subRepetition.event_type !== ERepetitionType.WORKSHOP">
								{{ getPlayName(subRepetition.play_sid) }}
							</div>
						</li>
					</template>
				</template>
				<template v-else>
					<template v-for="(subRepetition, index) in proxyRepetition.subRepetitions" :key="subRepetition.play_sid">
						<li>
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
								<option v-for="option in optionListPlays" :value="option.value">
									{{ option.text }}
								</option>
							</select>
							<button
								v-show="repetition.subRepetitions.length > 1"
								class="modify-subrepetition"
								@click="deleteSubRepetition(index)"
							>
								-
							</button>
						</li>
					</template>
				</template>
			</ul>
		</li>
		<li class="modify-item">
			<button @click="modifyRepetition" :disabled="isDemo">{{ editCard ? 'OK' : 'Редактировать' }}</button>
			<button v-show="!isDemo && editCard" @click="cancelModifyRepetition">Отменить</button>
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
	content: '•';
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
