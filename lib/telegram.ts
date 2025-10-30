// Хелперы для работы с Telegram Mini App

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface InitData {
  user?: TelegramUser;
  auth_date: number;
  hash: string;
}

// Получить данные пользователя из Telegram
export const getTelegramUser = (): TelegramUser | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    // @ts-ignore
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      return tg.initDataUnsafe.user;
    }
  } catch (e) {
    console.error('Failed to get Telegram user:', e);
  }
  
  return null;
};

// Получить полные init_data
export const getTelegramInitData = (): string => {
  if (typeof window === 'undefined') return '';
  
  try {
    // @ts-ignore
    const tg = window.Telegram?.WebApp;
    return tg?.initData || '';
  } catch (e) {
    console.error('Failed to get Telegram init data:', e);
  }
  
  return '';
};

// Инициализировать Telegram WebApp
export const initTelegram = () => {
  if (typeof window === 'undefined') return;
  
  try {
    // @ts-ignore
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      // Устанавливаем цвет заголовка
      tg.setHeaderColor('#1a1a1a');
      tg.setBackgroundColor('#0f0f0f');
    }
  } catch (e) {
    console.error('Failed to initialize Telegram:', e);
  }
};

// Закрыть WebApp
export const closeTelegram = () => {
  if (typeof window === 'undefined') return;
  
  try {
    // @ts-ignore
    window.Telegram?.WebApp?.close();
  } catch (e) {
    console.error('Failed to close Telegram:', e);
  }
};

// Показать кнопку "Назад"
export const showBackButton = (callback: () => void) => {
  if (typeof window === 'undefined') return;
  
  try {
    // @ts-ignore
    const tg = window.Telegram?.WebApp;
    if (tg?.BackButton) {
      tg.BackButton.show();
      tg.BackButton.onClick(callback);
    }
  } catch (e) {
    console.error('Failed to show back button:', e);
  }
};

// Скрыть кнопку "Назад"
export const hideBackButton = () => {
  if (typeof window === 'undefined') return;
  
  try {
    // @ts-ignore
    const tg = window.Telegram?.WebApp;
    if (tg?.BackButton) {
      tg.BackButton.hide();
    }
  } catch (e) {
    console.error('Failed to hide back button:', e);
  }
};

// Вибрация
export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'soft' | 'rigid' | 'success' | 'warning' | 'error' = 'medium') => {
  if (typeof window === 'undefined') return;
  
  try {
    // @ts-ignore
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      if (type === 'success' || type === 'warning' || type === 'error') {
        tg.HapticFeedback.notificationOccurred(type);
      } else {
        tg.HapticFeedback.impactOccurred(type);
      }
    }
  } catch (e) {
    console.error('Failed to trigger haptic feedback:', e);
  }
};

