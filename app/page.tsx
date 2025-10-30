'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTelegramUser, initTelegram, hapticFeedback } from '@/lib/telegram';
import { api } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [lobbyCode, setLobbyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [telegramUser, setTelegramUser] = useState<any>(null);

  useEffect(() => {
    // Инициализация Telegram WebApp
    initTelegram();
    
    // Получаем данные пользователя
    const user = getTelegramUser();
    setTelegramUser(user);

    // Если пользователь не найден (для разработки)
    if (!user) {
      console.warn('Telegram user not found. Using mock data for development.');
      setTelegramUser({
        id: Math.floor(Math.random() * 1000000),
        first_name: 'Test User'
      });
    }
  }, []);

  const handleCreateLobby = async () => {
    if (!telegramUser) {
      setError('Пользователь не найден');
      return;
    }

    setLoading(true);
    setError('');
    hapticFeedback('medium');

    try {
      // Добавляем игрока, если его еще нет
      await api.addPlayer(
        telegramUser.first_name + (telegramUser.last_name ? ' ' + telegramUser.last_name : ''),
        String(telegramUser.id)
      ).catch(() => {
        // Игнорируем ошибку если игрок уже существует
      });

      // Создаем лобби
      const lobby = await api.createLobby(String(telegramUser.id));
      console.log('Created lobby:', lobby);
      console.log('Lobby code:', lobby.lobby_code);
      
      if (!lobby.lobby_code) {
        setError('Лобби создано, но код не получен');
        return;
      }
      
      hapticFeedback('success');
      router.push(`/lobby/${lobby.lobby_code}`);
    } catch (err: any) {
      console.error('Error creating lobby:', err);
      setError('Не удалось создать лобби');
      hapticFeedback('error');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLobby = async () => {
    if (!lobbyCode.trim()) {
      setError('Введите код лобби');
      hapticFeedback('error');
      return;
    }

    if (!telegramUser) {
      setError('Пользователь не найден');
      return;
    }

    setLoading(true);
    setError('');
    hapticFeedback('medium');

    try {
      // Добавляем игрока, если его еще нет
      await api.addPlayer(
        telegramUser.first_name + (telegramUser.last_name ? ' ' + telegramUser.last_name : ''),
        String(telegramUser.id)
      ).catch(() => {
        // Игнорируем ошибку если игрок уже существует
      });

      // Присоединяемся к лобби
      await api.joinLobby(lobbyCode.toUpperCase(), String(telegramUser.id));
      
      hapticFeedback('success');
      router.push(`/lobby/${lobbyCode.toUpperCase()}`);
    } catch (err: any) {
      console.error('Error joining lobby:', err);
      setError('Не удалось присоединиться к лобби');
      hapticFeedback('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Заголовок */}
        <div className="text-center space-y-4">
          <div className="relative">
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-pulse">
              ФАЗЕРЭС
            </h1>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 mt-2">
              ГРЕЙВ
            </h2>
          </div>
          <div className="inline-block px-4 py-2 bg-purple-600/30 rounded-full border border-purple-400/30">
            <p className="text-purple-200 text-sm font-semibold">5 на 5</p>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            Капитанский драфт для вашей команды
          </p>
        </div>

        {/* Карточка с действиями */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-2xl space-y-6">
          {/* Кнопка создать лобби */}
          <button
            onClick={handleCreateLobby}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Создание...
              </span>
            ) : (
              'Создать лобби'
            )}
          </button>

          {/* Разделитель */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-800/50 text-gray-400">или</span>
            </div>
          </div>

          {/* Форма присоединения */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={lobbyCode}
                onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                placeholder="Код лобби"
                maxLength={6}
                className="flex-1 bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase text-center text-lg font-mono tracking-widest"
                disabled={loading}
              />
              <button
                onClick={handleJoinLobby}
                disabled={loading || !lobbyCode.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Войти
              </button>
            </div>
            <p className="text-gray-500 text-xs text-center">
              Введите 6-значный код лобби
            </p>
          </div>

          {/* Ошибка */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}
        </div>

        {/* Информация о пользователе (для отладки) */}
        {telegramUser && (
          <div className="text-center text-gray-500 text-xs">
            Привет, {telegramUser.first_name}!
          </div>
        )}
      </div>
    </main>
  );
}
