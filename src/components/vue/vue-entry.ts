import type { App } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import Repetition from '@components/vue/admin/views/Repetitions.vue';
import Performances from '@components/vue/admin/views/Performances.vue';
import Plays from '@components/vue/admin/views/Plays.vue';
import Stages from '@components/vue/admin/views/Stages.vue';
// import Visitors from '@components/vue/admin/views/Visitors.vue';

const Visitors = () => import('@components/vue/admin/views/Visitors.vue');

export default (app: App) => {
	if (!import.meta.env.SSR) {
		const routes = [
			{ path: '/admin/repetitions', component: Repetition, alias: '/admin' },
			{ path: '/admin/performances', component: Performances },
			{ path: '/admin/plays', component: Plays },
			{ path: '/admin/stages', component: Stages },
			{ path: '/admin/visitors', component: Visitors },
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
