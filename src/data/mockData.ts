import type { Patient, Anamnesis, Anthropometry, DietPlan, Appointment, Supplement, EvolutionPhoto, ClinicProfile } from '../types';

export const PATIENT_RAPHAEL_ID = '00000000-0000-4000-8000-000000000001';
export const PATIENT_CAMILA_ID = '00000000-0000-4000-8000-000000000002';

export const INITIAL_CLINIC_PROFILE: ClinicProfile = {
  nutritionistName: 'Raphael',
  crn: '',
  clinicName: 'NutriPlan Pro',
  email: 'raphacalixto10@gmail.com',
  phone: '',
  address: '',
  instagram: ''
};

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: PATIENT_RAPHAEL_ID,
    name: 'Raphael',
    email: 'raphael@email.com',
    phone: '(11) 98888-7777',
    birthDate: '1996-05-10',
    gender: 'male',
    occupation: 'Empresário',
    goal: 'weight_loss',
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    notes: 'Paciente focado em perda de gordura abdominal e definição muscular. Treina musculação 5x na semana.',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-03-12T15:00:00Z'
  },
  {
    id: PATIENT_CAMILA_ID,
    name: 'Camila Silva Santos',
    email: 'camila.santos@email.com',
    phone: '(11) 98765-4321',
    birthDate: '1995-04-12',
    gender: 'female',
    occupation: 'Arquiteta',
    goal: 'weight_loss',
    status: 'active',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    notes: 'Objetivo de perder 6kg de gordura e aumentar disposição. Treina musculação 4x/semana.',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-03-01T14:30:00Z'
  }
];

export const INITIAL_ANAMNESIS: Record<string, Anamnesis> = {
  [PATIENT_RAPHAEL_ID]: {
    id: '10000000-0000-4000-8000-000000000001',
    patientId: PATIENT_RAPHAEL_ID,
    mainComplaint: 'Desejo de reduzir percentual de gordura (de 22% para 14%) mantendo massa muscular, melhorar o rendimento nos treinos e reduzir a ansiedade por comida doce à noite.',
    clinicalHistory: {
      pathologies: ['Nenhuma patologia diagnosticada'],
      familyHistory: ['Pai hipertenso'],
      medications: 'Não faz uso contínuo',
      surgeries: 'Nenhuma cirurgia',
      bowelHabits: 'Regular diário (1 a 2x ao dia)'
    },
    lifestyle: {
      sleepHours: 7,
      stressLevel: 'moderate',
      smoking: false,
      alcohol: 'Eventual (1 cerveja a cada 15 dias)',
      physicalActivity: 'Musculação intensa + cardio',
      activityFrequency: '5x por semana (60 min musculação + 20 min esteira)'
    },
    dietaryHistory: {
      waterIntakeMl: 3000,
      preferredFoods: 'Frango grelhado, ovos, arroz branco, batata doce, banana com aveia, pasta de amendoim, café preto',
      dislikedFoods: 'Beterraba cozida, fígado',
      allergies: [],
      foodIntolerances: [],
      appetite: 'Normal ao longo do dia, pico de fome pós-treino',
      recall24h: 'Café: 3 ovos mexidos + 2 fatias de pão integral + café s/ açúcar. Almoço: 150g frango + 150g arroz + feijão + salada. Lanche: 1 scoop Whey + 1 banana + aveia. Jantar: 150g patinho moído + 120g batata doce + legumes.',
      weekendHabits: 'Mantém dieta no sábado, faz 1 refeição livre no domingo à noite.'
    },
    updatedAt: '2026-03-12T15:00:00Z'
  },
  [PATIENT_CAMILA_ID]: {
    id: '10000000-0000-4000-8000-000000000002',
    patientId: PATIENT_CAMILA_ID,
    mainComplaint: 'Dificuldade para perder gordura abdominal, inchaço frequente e cansaço à tarde.',
    clinicalHistory: {
      pathologies: ['Rinite Alérgica'],
      familyHistory: ['Mãe: Hipotireoidismo'],
      medications: 'Vitamina D',
      surgeries: 'Nenhuma',
      bowelHabits: 'Regular'
    },
    lifestyle: {
      sleepHours: 7,
      stressLevel: 'moderate',
      smoking: false,
      alcohol: 'Social',
      physicalActivity: 'Musculação',
      activityFrequency: '4x por semana'
    },
    dietaryHistory: {
      waterIntakeMl: 2000,
      preferredFoods: 'Frutas vermelhas, frango, ovos, queijo',
      dislikedFoods: 'Coentro, quiabo',
      allergies: ['Camarão'],
      foodIntolerances: [],
      appetite: 'Normal',
      recall24h: 'Ovos, arroz, feijão, frango e salada.',
      weekendHabits: 'Almoço em família aos domingos.'
    },
    updatedAt: '2026-03-01T14:30:00Z'
  }
};

export const INITIAL_ANTHROPOMETRY: Record<string, Anthropometry[]> = {
  [PATIENT_RAPHAEL_ID]: [
    {
      id: '20000000-0000-4000-8000-000000000001',
      patientId: PATIENT_RAPHAEL_ID,
      date: '2026-01-10',
      weight: 81.5,
      height: 165,
      bmi: 29.9,
      bodyFatPercentage: 24.2,
      fatMassKg: 19.7,
      leanMassKg: 61.8,
      waist: 89.0,
      abdomen: 94.5,
      hip: 103.0,
      armRelaxed: 35.0,
      armContracted: 38.0,
      thigh: 59.0,
      chest: 104.0,
      calf: 38.5,
      skinfoldTriceps: 16,
      skinfoldSubscapular: 20,
      skinfoldSuprailiac: 24,
      skinfoldAbdominal: 28,
      skinfoldThigh: 20,
      skinfoldChest: 14,
      protocol: 'pollock_3',
      notes: 'Avaliação inicial: Foco em déficit calórico controlado para preservação de massa muscular.'
    },
    {
      id: '20000000-0000-4000-8000-000000000002',
      patientId: PATIENT_RAPHAEL_ID,
      date: '2026-02-10',
      weight: 78.5,
      height: 165,
      bmi: 28.8,
      bodyFatPercentage: 20.8,
      fatMassKg: 16.3,
      leanMassKg: 62.2,
      waist: 85.0,
      abdomen: 90.0,
      hip: 101.0,
      armRelaxed: 35.2,
      armContracted: 38.5,
      thigh: 58.5,
      chest: 104.5,
      calf: 38.5,
      skinfoldTriceps: 13,
      skinfoldSubscapular: 17,
      skinfoldSuprailiac: 19,
      skinfoldAbdominal: 23,
      skinfoldThigh: 17,
      skinfoldChest: 11,
      protocol: 'pollock_3',
      notes: 'Retorno 30 dias: Perda de 3kg, -4.5cm de abdômen e ganho de 400g de massa magra!'
    },
    {
      id: '20000000-0000-4000-8000-000000000003',
      patientId: PATIENT_RAPHAEL_ID,
      date: '2026-03-12',
      weight: 76.0,
      height: 165,
      bmi: 27.9,
      bodyFatPercentage: 17.5,
      fatMassKg: 13.3,
      leanMassKg: 62.7,
      waist: 81.0,
      abdomen: 85.5,
      hip: 99.0,
      armRelaxed: 35.5,
      armContracted: 39.0,
      thigh: 58.0,
      chest: 105.0,
      calf: 38.5,
      skinfoldTriceps: 10,
      skinfoldSubscapular: 14,
      skinfoldSuprailiac: 15,
      skinfoldAbdominal: 18,
      skinfoldThigh: 14,
      skinfoldChest: 9,
      protocol: 'pollock_3',
      notes: 'Retorno 60 dias: Total de 5.5kg eliminados! -9cm de abdômen. Excelente definição corporal.'
    }
  ],
  [PATIENT_CAMILA_ID]: [
    {
      id: '20000000-0000-4000-8000-000000000004',
      patientId: PATIENT_CAMILA_ID,
      date: '2026-01-15',
      weight: 68.5,
      height: 165,
      bmi: 25.2,
      bodyFatPercentage: 29.5,
      fatMassKg: 20.2,
      leanMassKg: 48.3,
      waist: 78,
      abdomen: 86,
      hip: 104,
      armRelaxed: 28.5,
      armContracted: 29.5,
      thigh: 58,
      protocol: 'pollock_3',
      notes: 'Primeira avaliação física.'
    }
  ]
};

export const INITIAL_DIET_PLANS: Record<string, DietPlan[]> = {
  [PATIENT_RAPHAEL_ID]: [
    {
      id: '30000000-0000-4000-8000-000000000001',
      patientId: PATIENT_RAPHAEL_ID,
      title: 'Plano Alimentar - Definição Muscular & Performance (Fase 2)',
      description: 'Dieta hiperproteica (2.0g/kg) calculada para 76kg, com timing estratégico de carboidratos ao redor do treino para manter a intensidade e queimar gordura.',
      targetCalories: 2100,
      targetProtein: 155,
      targetCarbs: 230,
      targetFats: 58,
      waterTargetMl: 3200,
      active: true,
      guidelines: [
        'Beba no mínimo 3,2 litros de água por dia para acelerar a taxa metabólica e retenção muscular.',
        'Refeição pré-treino 1h30 antes do treino de musculação.',
        'Salada de folhas verdes à vontade no almoço e jantar para saciedade e micronutrientes.',
        'Evite líquidos durante as refeições principais (aguarde 30 min antes/depois).'
      ],
      meals: [
        {
          id: '31000000-0000-4000-8000-000000000001',
          name: 'Café da Manhã',
          time: '07:30',
          order: 1,
          notes: 'Pode colocar canela em pó na banana com aveia a gosto.',
          items: [
            {
              id: '32000000-0000-4000-8000-000000000001',
              foodId: 'taco-18',
              foodName: 'Ovo de galinha inteiro cozido / mexido',
              quantity: 3,
              unit: 'unidades (150g)',
              calories: 219,
              protein: 20.0,
              carbs: 0.9,
              fats: 14.3,
              fiber: 0.0,
              substitutes: ['4 claras + 1 ovo inteiro', '120g de queijo cottage']
            },
            {
              id: '32000000-0000-4000-8000-000000000002',
              foodId: 'taco-6',
              foodName: 'Pão de forma 100% integral',
              quantity: 2,
              unit: 'fatias (50g)',
              calories: 120,
              protein: 5.8,
              carbs: 21.5,
              fats: 1.4,
              fiber: 3.5,
              substitutes: ['1 tapioca média (60g)', '40g de aveia em flocos']
            },
            {
              id: '32000000-0000-4000-8000-000000000003',
              foodId: 'taco-35',
              foodName: 'Banana prata crua',
              quantity: 1,
              unit: 'unidade média (70g)',
              calories: 62,
              protein: 0.9,
              carbs: 16.0,
              fats: 0.1,
              fiber: 1.4
            }
          ]
        },
        {
          id: '31000000-0000-4000-8000-000000000002',
          name: 'Almoço',
          time: '12:30',
          order: 2,
          notes: 'Azeite de oliva extravirgem por cima dos vegetais.',
          items: [
            {
              id: '32000000-0000-4000-8000-000000000004',
              foodId: 'taco-17',
              foodName: 'Peito de frango grelhado sem pele',
              quantity: 160,
              unit: 'g',
              calories: 254,
              protein: 51.2,
              carbs: 0.0,
              fats: 4.0,
              fiber: 0.0,
              substitutes: ['150g de patinho moído grelhado', '170g de tilápia grelhada']
            },
            {
              id: '32000000-0000-4000-8000-000000000005',
              foodId: 'taco-1',
              foodName: 'Arroz branco cozido',
              quantity: 5,
              unit: 'colheres de sopa (125g)',
              calories: 160,
              protein: 3.1,
              carbs: 35.1,
              fats: 0.3,
              fiber: 2.0,
              substitutes: ['150g de batata inglesa cozida', '130g de mandioca']
            },
            {
              id: '32000000-0000-4000-8000-000000000006',
              foodId: 'taco-13',
              foodName: 'Feijão carioca cozido',
              quantity: 1,
              unit: 'concha média (130g)',
              calories: 99,
              protein: 6.2,
              carbs: 17.7,
              fats: 0.7,
              fiber: 11.1
            },
            {
              id: '32000000-0000-4000-8000-000000000007',
              foodId: 'taco-47',
              foodName: 'Azeite de oliva extravirgem',
              quantity: 1,
              unit: 'colher de sobremesa (8g)',
              calories: 71,
              protein: 0.0,
              carbs: 0.0,
              fats: 8.0,
              fiber: 0.0
            },
            {
              id: '32000000-0000-4000-8000-000000000008',
              foodId: 'taco-45',
              foodName: 'Brócolis cozido no vapor',
              quantity: 1,
              unit: 'xícara (80g)',
              calories: 20,
              protein: 1.7,
              carbs: 3.5,
              fats: 0.4,
              fiber: 2.7
            }
          ]
        },
        {
          id: '31000000-0000-4000-8000-000000000003',
          name: 'Lanche da Tarde (Pré-Treino)',
          time: '16:30',
          order: 3,
          notes: 'Consumir 1 hora antes de iniciar os treinos.',
          items: [
            {
              id: '32000000-0000-4000-8000-000000000009',
              foodId: 'taco-32',
              foodName: 'Whey Protein Concentrado 80%',
              quantity: 1,
              unit: 'scoop (30g)',
              calories: 120,
              protein: 24.0,
              carbs: 1.8,
              fats: 1.8,
              fiber: 0.0
            },
            {
              id: '32000000-0000-4000-8000-000000000010',
              foodId: 'taco-3',
              foodName: 'Aveia em flocos',
              quantity: 2,
              unit: 'colheres de sopa (30g)',
              calories: 118,
              protein: 4.2,
              carbs: 20.0,
              fats: 2.5,
              fiber: 2.7
            },
            {
              id: '32000000-0000-4000-8000-000000000011',
              foodId: 'taco-36',
              foodName: 'Maçã gala com casca',
              quantity: 1,
              unit: 'unidade média (130g)',
              calories: 73,
              protein: 0.4,
              carbs: 19.2,
              fats: 0.3,
              fiber: 2.6
            }
          ]
        },
        {
          id: '31000000-0000-4000-8000-000000000004',
          name: 'Jantar (Pós-Treino)',
          time: '20:00',
          order: 4,
          notes: 'Refeição anabólica de recuperação muscular.',
          items: [
            {
              id: '32000000-0000-4000-8000-000000000012',
              foodId: 'taco-20',
              foodName: 'Patinho bovino moído / grelhado',
              quantity: 150,
              unit: 'g',
              calories: 278,
              protein: 45.8,
              carbs: 0.0,
              fats: 9.0,
              fiber: 0.0,
              substitutes: ['160g de frango grelhado', '170g de salmão grelhado']
            },
            {
              id: '32000000-0000-4000-8000-000000000013',
              foodId: 'taco-10',
              foodName: 'Batata doce cozida',
              quantity: 160,
              unit: 'g',
              calories: 123,
              protein: 1.0,
              carbs: 29.4,
              fats: 0.2,
              fiber: 3.5
            },
            {
              id: '32000000-0000-4000-8000-000000000014',
              foodId: 'taco-42',
              foodName: 'Alface e tomate à vontade',
              quantity: 1,
              unit: 'prato de salada (120g)',
              calories: 25,
              protein: 1.5,
              carbs: 4.5,
              fats: 0.2,
              fiber: 2.5
            },
            {
              id: '32000000-0000-4000-8000-000000000015',
              foodId: 'taco-47',
              foodName: 'Azeite de oliva extravirgem',
              quantity: 1,
              unit: 'colher de sobremesa (8g)',
              calories: 71,
              protein: 0.0,
              carbs: 0.0,
              fats: 8.0,
              fiber: 0.0
            }
          ]
        }
      ],
      createdAt: '2026-01-10T11:00:00Z',
      updatedAt: '2026-03-12T16:00:00Z'
    }
  ]
};

const getFormattedDate = (daysFromToday: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().split('T')[0];
};

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: '40000000-0000-4000-8000-000000000001',
    patientId: PATIENT_RAPHAEL_ID,
    patientName: 'Raphael',
    patientPhone: '5511988887777',
    date: getFormattedDate(0),
    time: '10:30',
    durationMinutes: 60,
    type: 'evaluation',
    status: 'confirmed',
    price: 280,
    paid: true,
    notes: 'Reavaliação física e ajuste de macronutrientes da nova fase de treino.',
    createdAt: '2026-03-01T10:00:00Z'
  },
  {
    id: '40000000-0000-4000-8000-000000000002',
    patientId: PATIENT_CAMILA_ID,
    patientName: 'Camila Silva Santos',
    patientPhone: '5511987654321',
    date: getFormattedDate(0),
    time: '14:30',
    durationMinutes: 60,
    type: 'follow_up',
    status: 'scheduled',
    price: 250,
    paid: true,
    notes: 'Avaliação de 60 dias e entrega do novo plano.',
    createdAt: '2026-03-01T10:00:00Z'
  }
];

export const INITIAL_SUPPLEMENTS: Record<string, Supplement[]> = {
  [PATIENT_RAPHAEL_ID]: [
    {
      id: '50000000-0000-4000-8000-000000000001',
      patientId: PATIENT_RAPHAEL_ID,
      name: 'Creatina Monohidratada 100% Pura',
      dosage: '5g ao dia',
      timing: 'Pós-treino ou junto ao almoço',
      instructions: 'Diluir em 200ml de água ou suco. Uso contínuo diário inclusive aos fins de semana.',
      active: true,
      createdAt: '2026-01-10T10:00:00Z'
    },
    {
      id: '50000000-0000-4000-8000-000000000002',
      patientId: PATIENT_RAPHAEL_ID,
      name: 'Whey Protein Concentrado 80%',
      dosage: '30g (1 dosador)',
      timing: 'Lanche da tarde (Pré-Treino)',
      instructions: 'Bater com água gelada ou leite desnatado conforme prescrição da dieta.',
      active: true,
      createdAt: '2026-01-10T10:00:00Z'
    },
    {
      id: '50000000-0000-4000-8000-000000000003',
      patientId: PATIENT_RAPHAEL_ID,
      name: 'Ômega 3 Ultra EPA/DHA',
      dosage: '2 cápsulas de 1000mg',
      timing: 'Junto ao jantar',
      instructions: 'Auxilia no controle inflamatório, perfil lipídico e recuperação muscular.',
      active: true,
      createdAt: '2026-01-10T10:00:00Z'
    }
  ],
  [PATIENT_CAMILA_ID]: [
    {
      id: '50000000-0000-4000-8000-000000000004',
      patientId: PATIENT_CAMILA_ID,
      name: 'Creatina Monohidratada',
      dosage: '3g ao dia',
      timing: 'Qualquer horário',
      instructions: 'Diluir em água.',
      active: true,
      createdAt: '2026-01-15T10:00:00Z'
    }
  ]
};

export const INITIAL_EVOLUTION_PHOTOS: Record<string, EvolutionPhoto[]> = {
  [PATIENT_RAPHAEL_ID]: [
    {
      id: '60000000-0000-4000-8000-000000000001',
      patientId: PATIENT_RAPHAEL_ID,
      date: '2026-01-10',
      angle: 'front',
      weight: 81.5,
      photoUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=80',
      notes: 'Início do acompanhamento: 81.5kg, acúmulo de gordura no abdômen.',
      createdAt: '2026-01-10T11:00:00Z'
    },
    {
      id: '60000000-0000-4000-8000-000000000002',
      patientId: PATIENT_RAPHAEL_ID,
      date: '2026-03-12',
      angle: 'front',
      weight: 76.0,
      photoUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=80',
      notes: '60 dias de evolução: 76kg (-5.5kg), definição visível e abdômen seco!',
      createdAt: '2026-03-12T16:00:00Z'
    },
    {
      id: '60000000-0000-4000-8000-000000000003',
      patientId: PATIENT_RAPHAEL_ID,
      date: '2026-01-10',
      angle: 'side',
      weight: 81.5,
      photoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80',
      notes: 'Perfil inicial',
      createdAt: '2026-01-10T11:00:00Z'
    },
    {
      id: '60000000-0000-4000-8000-000000000004',
      patientId: PATIENT_RAPHAEL_ID,
      date: '2026-03-12',
      angle: 'side',
      weight: 76.0,
      photoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80',
      notes: 'Perfil após 60 dias: postura ereta, redução de gordura visceral.',
      createdAt: '2026-03-12T16:00:00Z'
    }
  ]
};
