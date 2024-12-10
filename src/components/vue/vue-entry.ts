import type { App } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

import Repetition from '@vue-components/admin/repetitions/Repetitions.vue';
import Performances from '@vue-components/admin/performances/Performances.vue';
import Plays from '@vue-components/admin/plays/Plays.vue';
import Stages from '@vue-components/admin/stages/Stages.vue';
import Whatsapp from '@vue-components/admin/whatsapp/Whatsapp.vue';
// import Visitors from '@components/vue/admin/views/Visitors.vue';
const Tickets = () => import('@vue-components/admin/tickets/Tickets.vue');

export default (app: App) => {
	if (!import.meta.env.SSR) {
		const routes = [
			{ path: '/admin/repetitions', component: Repetition, alias: '/admin' },
			{ path: '/admin/performances', component: Performances },
			{ path: '/admin/plays', component: Plays },
			{ path: '/admin/stages', component: Stages },
			{ path: '/admin/whatsapp', component: Whatsapp },
			{ path: '/admin/tickets', component: Tickets },
		];

		const router = createRouter({
			history: createWebHistory(),
			routes,
			linkActiveClass: 'active',
			linkExactActiveClass: 'active',
		});
		app.use(router);
	}
};
