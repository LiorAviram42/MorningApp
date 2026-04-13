import { KidConfig, KidId, Task } from './types';

export const KIDS: Record<KidId, KidConfig> = {
  yuvali: {
    id: 'yuvali',
    name: 'יובלי',
    profileImg: '/profile_yuvali.png',
    gradient: 'linear-gradient(to right, #ffb3ba, #ffdfba)',
    outlineColor: '#ffb3ba',
  },
  maayani: {
    id: 'maayani',
    name: 'מעייני',
    profileImg: '/profile_maayani.png',
    gradient: 'linear-gradient(to right, #bae1ff, #d0f4de)',
    outlineColor: '#bae1ff',
  },
  palgi: {
    id: 'palgi',
    name: 'פלגי',
    profileImg: '/profile_palgi.png',
    gradient: 'linear-gradient(to right, #d0f4de, #f2f2c2)',
    outlineColor: '#d0f4de',
  },
};

export const getTasksForKid = (kidId: KidId): Task[] => {
  const baseTasks: Task[] = [
    { id: 'teeth', title: 'צחצוח\nשיניים', iconOff: '/icon_teeth_off.png', iconOn: '/icon_teeth_on.png', side: 'right' },
    { id: 'hair', title: 'סירוק', iconOff: '/icon_hair_off.png', iconOn: '/icon_hair_on.png', side: 'right' },
    { id: 'toilet', title: 'שירותים', iconOff: '/icon_toilet_off.png', iconOn: '/icon_toilet_on.png', side: 'right' },
    { id: 'face', title: 'שטיפת פנים', iconOff: '/icon_face_off.png', iconOn: '/icon_face_on.png', side: 'right' },
    { id: 'clothes', title: 'בגדים', iconOff: '/icon_clothes_off.png', iconOn: '/icon_clothes_on.png', side: 'left' },
    { id: 'shoes', title: 'נעליים', iconOff: '/icon_shoes_off.png', iconOn: '/icon_shoes_on.png', side: 'left' },
    { id: 'cereal', title: 'ארוחת בוקר', iconOff: '/icon_cereal_off.png', iconOn: '/icon_cereal_on.png', side: 'left' },
    { id: 'bag', title: 'תיק', iconOff: '/icon_bag_off.png', iconOn: '/icon_bag_on.png', side: 'left' }
  ];

  let tasks = [...baseTasks];

  const faceTask = tasks.find(t => t.id === 'face');
  if (faceTask) {
    const faceName = kidId === 'palgi' ? 'pelegi' : kidId;
    faceTask.iconOff = `/icon_face_${faceName}_off.png`;
    faceTask.iconOn = `/icon_face_${faceName}_on.png`;
  }

  if (kidId === 'maayani') {
    tasks = tasks.filter(t => t.id !== 'hair');
    const clothesTask = tasks.find(t => t.id === 'clothes');
    if (clothesTask) clothesTask.side = 'right';
  } else if (kidId === 'palgi') {
    tasks = tasks.filter(t => t.id !== 'bag');
    const toiletTask = tasks.find(t => t.id === 'toilet');
    if (toiletTask) {
      toiletTask.title = 'טיטול';
      toiletTask.iconOff = '/icon_diaper_off.png';
      toiletTask.iconOn = '/icon_diaper_on.png';
    }
  }

  return tasks;
};
