class BlobStorageManager {
    constructor() {
      this.isReady = true;
      this.baseUrl = '/api/data';
      console.log('🔥 Blob Storage Manager 초기화 완료 - 진짜 서버 DB야! 🚀');
    }
  
 
    async apiCall(endpoint, method = 'GET', data = null) {
      try {
        const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
        
        const options = {
          method,
          headers: { 'Content-Type': 'application/json' }
        };
        
        if (data) {
          options.body = JSON.stringify(data);
        }
  
        const response = await fetch(url, options);
        
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorData}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error(`API 호출 실패 [${method} ${endpoint}]:`, error);
        throw error;
      }
    }
  
 
    async saveChat(sender, message) {
      try {
        const result = await this.apiCall('', 'POST', { 
          type: 'chats', 
          data: { sender, message }
        });
        console.log('💬 채팅 저장 성공:', result.id);
        return result;
      } catch (error) {
        console.error('💬 채팅 저장 실패:', error);
        return null;
      }
    }
  
    async getChatHistory(limit = 50) {
      try {
        const chats = await this.apiCall('?type=chats');
        const limitedChats = chats.slice(0, limit);
        console.log(`💬 채팅 히스토리 로드: ${limitedChats.length}개`);
        return limitedChats;
      } catch (error) {
        console.error('💬 채팅 히스토리 로드 실패:', error);
        return [];
      }
    }
  
    async clearChats() {
      try {
        const result = await this.apiCall('', 'PUT', { 
          type: 'chats', 
          action: 'clear_all' 
        });
        console.log('💬 채팅 전체 삭제 완료');
        return result;
      } catch (error) {
        console.error('💬 채팅 삭제 실패:', error);
        return null;
      }
    }
 
    async saveLetter(type, letterData) {
      try {
        const result = await this.apiCall('', 'POST', { 
          type: `letters_${type}`, 
          data: letterData 
        });
        console.log(`💌 편지 저장 성공 (${type}):`, result.id);
        return result;
      } catch (error) {
        console.error(`💌 편지 저장 실패 (${type}):`, error);
        throw error;
      }
    }
  
    async getLetters(type) {
      try {
        const letters = await this.apiCall(`?type=letters_${type}`);
        console.log(`💌 편지 목록 로드 (${type}): ${letters.length}개`);
        return letters;
      } catch (error) {
        console.error(`💌 편지 로드 실패 (${type}):`, error);
        return [];
      }
    }
  
    async deleteLetter(id, password = '') {
      try {
 
        for (const type of ['to', 'from']) {
          try {
            const letters = await this.getLetters(type);
            const letter = letters.find(l => l.id === id);
            
            if (letter) {
 
              if (letter.password && letter.password !== password) {
                throw new Error('비밀번호가 일치하지 않습니다.');
              }
              
              const result = await this.apiCall('', 'DELETE', { 
                type: `letters_${type}`, 
                id 
              });
              console.log('💌 편지 삭제 완료:', id);
              return result;
            }
          } catch (error) {
            if (error.message.includes('비밀번호')) {
              throw error;
            }
 
          }
        }
        
        throw new Error('편지를 찾을 수 없습니다.');
      } catch (error) {
        console.error('💌 편지 삭제 실패:', error);
        throw error;
      }
    }
 
    async savePhoto(file, title, description, date) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const result = await this.apiCall('', 'POST', {
              type: 'photos',
              data: {
                title,
                description,
                date,
                imageData: e.target.result
              }
            });
            console.log('📸 사진 저장 성공:', result.id);
            resolve(result);
          } catch (error) {
            console.error('📸 사진 저장 실패:', error);
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('파일 읽기 실패'));
        reader.readAsDataURL(file);
      });
    }
  
    async getPhotos() {
      try {
        const photos = await this.apiCall('?type=photos');
 
        photos.forEach(photo => {
          if (photo.imageData && !photo.url) {
            photo.url = photo.imageData;
          }
        });
        console.log(`📸 사진 목록 로드: ${photos.length}개`);
        return photos;
      } catch (error) {
        console.error('📸 사진 로드 실패:', error);
        return [];
      }
    }
  
    async deletePhoto(id) {
      try {
        const result = await this.apiCall('', 'DELETE', { 
          type: 'photos', 
          id 
        });
        console.log('📸 사진 삭제 완료:', id);
        return result;
      } catch (error) {
        console.error('📸 사진 삭제 실패:', error);
        throw error;
      }
    }
 
    async saveTimelineEvent(eventData) {
      try {
        const result = await this.apiCall('', 'POST', { 
          type: 'timeline', 
          data: eventData 
        });
        console.log('🌟 타임라인 이벤트 저장 성공:', result.id);
        return result;
      } catch (error) {
        console.error('🌟 타임라인 이벤트 저장 실패:', error);
        throw error;
      }
    }
  
    async getTimelineEvents() {
      try {
        const events = await this.apiCall('?type=timeline');
 
        events.sort((a, b) => new Date(a.date) - new Date(b.date));
        console.log(`🌟 타임라인 이벤트 로드: ${events.length}개`);
        return events;
      } catch (error) {
        console.error('🌟 타임라인 로드 실패:', error);
        return [];
      }
    }
  
    async deleteTimelineEvent(id) {
      try {
        const result = await this.apiCall('', 'DELETE', { 
          type: 'timeline', 
          id 
        });
        console.log('🌟 타임라인 이벤트 삭제 완료:', id);
        return result;
      } catch (error) {
        console.error('🌟 타임라인 이벤트 삭제 실패:', error);
        throw error;
      }
    }
   
    collection(name) {
      return {
        add: async (data) => {
          switch (name) {
            case 'chats':
              return await this.saveChat(data.sender, data.message);
            case 'lettersToNyangkun':
              return await this.saveLetter('to', data);
            case 'lettersFromNyangkun':
              return await this.saveLetter('from', data);
            case 'timeline':
              return await this.saveTimelineEvent(data);
            default:
              console.warn(`지원하지 않는 컬렉션: ${name}`);
              return { id: 'unsupported' };
          }
        },
        
        get: async () => {
          let docs = [];
          switch (name) {
            case 'chats':
              docs = await this.getChatHistory();
              break;
            case 'lettersToNyangkun':
              docs = await this.getLetters('to');
              break;
            case 'lettersFromNyangkun':
              docs = await this.getLetters('from');
              break;
            case 'photos':
              docs = await this.getPhotos();
              break;
            case 'timeline':
              docs = await this.getTimelineEvents();
              break;
            default:
              console.warn(`지원하지 않는 컬렉션: ${name}`);
          }
          
          return {
            empty: docs.length === 0,
            docs: docs.map(doc => ({
              id: doc.id,
              data: () => doc
            }))
          };
        }
      };
    }
   
    async testConnection() {
      try {
        await this.apiCall('?type=chats');
        console.log('✅ Blob Storage 연결 테스트 성공!');
        return true;
      } catch (error) {
        console.error('❌ Blob Storage 연결 테스트 실패:', error);
        return false;
      }
    }
 
    async getStats() {
      try {
        const stats = {};
        const types = ['chats', 'letters_to', 'letters_from', 'photos', 'timeline'];
        
        for (const type of types) {
          try {
            const data = await this.apiCall(`?type=${type}`);
            stats[type] = data.length;
          } catch (error) {
            stats[type] = 0;
          }
        }
        
        console.log('📊 데이터 통계:', stats);
        return stats;
      } catch (error) {
        console.error('📊 통계 로드 실패:', error);
        return {};
      }
    }
  }
  
  if (typeof window !== 'undefined') {
    window.blobManager = new BlobStorageManager();
    window.db = window.blobManager; 
    window.initializeFirebase = async () => {
      console.log('🔄 Firebase 대신 Blob Storage 사용');
      return { db: window.blobManager };
    };
    
    window.testFirebaseConnection = () => window.blobManager.testConnection();
    
    console.log('🎉 Blob Storage Manager 전역 설정 완료 - 진짜 서버 DB로 업그레이드! 🔥');
  }

  export default BlobStorageManager;