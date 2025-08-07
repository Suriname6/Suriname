#!/usr/bin/env node
/**
 * Suriname 개발 환경 정리 스크립트
 * 모든 개발 서버와 관련 프로세스 정리
 */

const { exec } = require('child_process');
const PortManager = require('./port-manager');

class DevStopper {
  constructor() {
    this.portManager = new PortManager();
    this.isWindows = process.platform === 'win32';
  }

  /**
   * 개발 환경 정리
   */
  async stop() {
    console.log('🛑 Suriname 개발 환경 정리 시작...\n');

    try {
      // 1. 포트별 프로세스 종료
      await this.killDevelopmentProcesses();
      
      // 2. Node.js 개발 서버 정리
      await this.cleanNodeProcesses();
      
      // 3. Java 프로세스 정리
      await this.cleanJavaProcesses();
      
      // 4. 최종 포트 상태 확인
      setTimeout(async () => {
        console.log('\n📊 정리 후 포트 상태:');
        await this.portManager.checkPortStatus();
        console.log('\n✅ 개발 환경 정리 완료!');
      }, 2000);
      
    } catch (error) {
      console.error('❌ 정리 중 오류:', error.message);
    }
  }

  /**
   * 개발용 포트 프로세스 종료
   */
  async killDevelopmentProcesses() {
    const devPorts = [8080, 8081, 8082, 8083, 3000, 5173, 5174, 5175];
    
    console.log('1️⃣ 개발 포트 프로세스 종료...');
    
    for (const port of devPorts) {
      try {
        await this.portManager.killPortProcess(port);
        await this.sleep(500); // 프로세스 종료 대기
      } catch (error) {
        // 포트에 프로세스가 없는 경우 무시
        console.log(`포트 ${port}: 실행 중인 프로세스 없음`);
      }
    }
  }

  /**
   * Node.js 개발 서버 정리
   */
  async cleanNodeProcesses() {
    console.log('\n2️⃣ Node.js 개발 서버 정리...');
    
    return new Promise((resolve) => {
      const command = this.isWindows 
        ? 'tasklist /fi "ImageName eq node.exe" /fo csv | find "node.exe"'
        : 'pgrep -f "vite\\|webpack\\|dev"';

      exec(command, (error, stdout) => {
        if (stdout.trim()) {
          console.log('Node.js 개발 프로세스 발견, 정리 중...');
          
          const killCommand = this.isWindows
            ? 'taskkill /f /im node.exe'
            : 'pkill -f "vite|webpack|dev"';
          
          exec(killCommand, (killError) => {
            if (killError) {
              console.log('Node.js 프로세스 정리 완료');
            } else {
              console.log('✅ Node.js 프로세스 정리 완료');
            }
            resolve();
          });
        } else {
          console.log('Node.js 개발 프로세스 없음');
          resolve();
        }
      });
    });
  }

  /**
   * Java Spring Boot 프로세스 정리
   */
  async cleanJavaProcesses() {
    console.log('\n3️⃣ Spring Boot 프로세스 정리...');
    
    return new Promise((resolve) => {
      const command = this.isWindows
        ? 'jps | find "SurinameApplication"'
        : 'jps | grep SurinameApplication';

      exec(command, (error, stdout) => {
        if (stdout.trim()) {
          console.log('Spring Boot 프로세스 발견, 정리 중...');
          
          const lines = stdout.trim().split('\n');
          lines.forEach(line => {
            const pid = line.split(' ')[0];
            if (pid) {
              exec(`kill ${pid}`, (killError) => {
                if (!killError) {
                  console.log(`✅ Spring Boot 프로세스 ${pid} 종료`);
                }
              });
            }
          });
        } else {
          console.log('Spring Boot 프로세스 없음');
        }
        resolve();
      });
    });
  }

  /**
   * 특정 프로세스명으로 정리
   */
  async killByProcessName(processName) {
    return new Promise((resolve) => {
      const command = this.isWindows
        ? `taskkill /f /im ${processName}`
        : `pkill -f ${processName}`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.log(`${processName} 프로세스 없음`);
        } else {
          console.log(`✅ ${processName} 프로세스 정리 완료`);
        }
        resolve();
      });
    });
  }

  /**
   * 유틸리티 - Sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 강제 전체 정리 (위험)
   */
  async forceCleanAll() {
    console.log('⚠️ 강제 전체 정리 시작... (모든 Node.js/Java 프로세스 종료)');
    
    if (this.isWindows) {
      await this.killByProcessName('node.exe');
      await this.killByProcessName('java.exe');
    } else {
      await this.killByProcessName('node');
      await this.killByProcessName('java');
    }
    
    console.log('✅ 강제 정리 완료');
  }
}

// CLI 실행
if (require.main === module) {
  const devStopper = new DevStopper();
  const command = process.argv[2];
  
  switch (command) {
    case 'force':
      devStopper.forceCleanAll();
      break;
      
    case 'ports':
      devStopper.killDevelopmentProcesses();
      break;
      
    case 'node':
      devStopper.cleanNodeProcesses();
      break;
      
    case 'java':
      devStopper.cleanJavaProcesses();
      break;
      
    default:
      devStopper.stop();
  }
}

module.exports = DevStopper;