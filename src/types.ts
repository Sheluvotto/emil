export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatHistory {
  id: string;
  messages: Message[];
  lastUpdated: number;
}

export interface Model {
  id: string;
  name: string;
  description: string;
}

export const AVAILABLE_MODELS: Model[] = [
  {
    id: 'mistralai/mistral-nemo',
    name: 'Emil Nemo',
    description: 'Modelo avanzado optimizado para tareas generales con fuertes capacidades de razonamiento'
  },
  {
    id: 'mistralai/mistral-small-24b-instruct-2501:free',
    name: 'Emil Pequeño',
    description: 'Modelo eficiente que sigue instrucciones, adecuado para diversas tareas'
  },
  {
    id: 'open-r1/olympiccoder-32b:free',
    name: 'Emil Sabio',
    description: 'Modelo especializado con capacidades mejoradas de razonamiento y análisis'
  }
];