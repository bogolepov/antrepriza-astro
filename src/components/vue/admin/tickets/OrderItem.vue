<script setup lang="ts">
import { ref } from 'vue';
import type { TReservationItem, TTicketItem } from '@scripts/types/reservation';
import { getPrices } from '../lib/statesStore';
import type { IPriceJson } from '@scripts/adminpanel/types/json-files';

interface Props {
	order: TReservationItem;
}
const { order } = defineProps<Props>();

const showCard = ref(false);

const prices: IPriceJson[] = getPrices();

function ticketsCount(tickets: TTicketItem[]): number {
	if (!tickets || !tickets.length) return 0;
	let n = 0;
	tickets.forEach(item => {
		n += item.count;
	});
	return n;
}

function getPriceText(ticket_type: string): string {
	const item = prices.find(t => t.type === ticket_type);
	if (item) return `${item.text_short.ru.toLowerCase()} (${item.value}€)`;
}
</script>

<template>
	<li class="order-item">
		<div class="order-info">
			<div class="order-id click-item" @click="showCard = !showCard">{{ order.order_id }}</div>
			<div class="order-user">
				<div class="click-item" @click="showCard = !showCard">{{ order.name }}</div>
				<div class="order-email">{{ order.email }}</div>
				<ul class="ticket-card" v-show="showCard">
					<template v-for="ticket in order.tickets">
						<li class="ticket-type">
							<div>{{ getPriceText(ticket.type) }}</div>
							<div>{{ ticket.count }}</div>
						</li>
					</template>
				</ul>
			</div>
		</div>
		<div class="count-item order-count click-item" @click="showCard = !showCard">{{ ticketsCount(order.tickets) }}</div>
	</li>
</template>

<style>
li.order-item {
	--between-columns: 1.3em;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: flex-start;
	flex-wrap: nowrap;
	line-height: 1.35;
}
li.order-item + li.order-item {
	margin-top: 0.8em;
}
.order-item .order-info {
	flex-grow: 1;
	display: flex;
	flex-wrap: wrap;
	align-items: flex-start;
}
.order-item .order-id {
	min-width: 5.8rem;
}
.order-info .order-user {
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	padding-left: var(--between-columns);
	text-wrap: wrap;
}
.order-info .order-email {
	font-size: smaller;
	color: #00bfff;
}
.order-count {
	padding-left: var(--between-columns);
}

.order-card {
	display: grid;
	min-height: 20px;
	background-color: aqua;
}
.order-item .click-item {
	cursor: pointer;
}

.ticket-card {
	padding-left: 1em;
	padding-top: 0.35em;
	/* background-color: var(--grey-78); */
}
.ticket-type {
	display: flex;
	width: 100%;
	justify-content: space-between;
	color: hsl(0, 0%, 55%);
}
</style>
