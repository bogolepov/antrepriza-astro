import { ref, reactive } from 'vue';
import { EAuthRole } from '@scripts/auth';

// export const vueStore = reactive({
// 	showMen: true,
// });
export const showMenu = ref(true);
export const smallScreen = ref(false);
export const isDemo = ref(true);

export function setAuthRole(role: EAuthRole) {
	if (role === EAuthRole.DEMO) isDemo.value = true;
	else isDemo.value = false;
}
