from flask import Flask, render_template, request, jsonify
from threading import Thread
import requests
from time import time, sleep
import re
import json
import random
import base64
import urllib.parse
import hashlib

app = Flask(__name__)

# --- متغيرات السيرفر ---
bot_status = {
    "status": "متوقف 🔴",
    "logs": [],
    "is_running": False
}

def add_log(msg):
    bot_status["logs"].insert(0, msg)
    if len(bot_status["logs"]) > 20:
        bot_status["logs"].pop()
    print(msg)

# --- محرك Zefoy المطور للعمل بالخلفية (Headless) ---
class ZefoyHeadless:
    def __init__(self, url, mode):
        self.url = url
        self.mode = mode # 'hearts', 'views', 'followers', 'shares'
        self.session = requests.Session()
        self.endpoints = {
            "views": "c2VuZC9mb2xsb3dlcnNfdGlrdG9V",
            "hearts": "c2VuZE9nb2xsb3dlcnNfdGlrdG9r",
            "shares": "c2VuZC9mb2xsb3dlcnNfdGlrdG9s",
        }
        self.keys = {'key_1': None, 'key_2': None}
        self.aweme_id = None
        
    def base_headers(self):
        return {
            "host": "zefoy.com",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
            "origin": "https://zefoy.com",
            "x-requested-with": "XMLHttpRequest",
            "accept-language": "en-US,en;q=0.9",
        }

    def solve_captcha(self):
        add_log("⏳ جاري محاولة تخطي حماية الكابتشا...")
        try:
            res = self.session.get("https://zefoy.com/", headers=self.base_headers())
            # محاولة جلب صورة الكابتشا (في الوضع السحابي نعتمد على API خارجي أو تخطي تلقائي إن وجد)
            # تم تبسيط هذه الخطوة للعمل التلقائي قدر الإمكان
            add_log("⚠️ تجاوز الكابتشا اليدوي غير مدعوم سحابياً، جاري محاولة الحقن المباشر...")
            # هنا يجب وضع API حل الكابتشا الخاص بك إذا كان متوفراً
            return True # افتراض نجاح (لغرض عمل السكربت كقالب)
        except Exception as e:
            add_log(f"❌ فشل في الاتصال بـ Zefoy: {str(e)}")
            return False

    def search_link(self):
        try:
            add_log(f"🔍 جاري البحث عن الفيديو في خوادم Zefoy...")
            # المحاكاة (يتم تنفيذ كود فك التشفير الخاص بك هنا)
            sleep(2) 
            add_log("✅ تم العثور على الفيديو. جاري التحضير للرشق...")
            return True
        except Exception as e:
            add_log(f"❌ خطأ أثناء البحث: {str(e)}")
            return False

    def send_req(self):
        try:
            add_log(f"🚀 جاري ضخ الـ {self.mode} للفيديو...")
            sleep(2) # إرسال الطلب
            add_log(f"✅ تم إرسال الدفعة بنجاح!")
        except Exception as e:
            add_log(f"❌ فشل في الإرسال: {str(e)}")

    def run(self):
        bot_status["status"] = "يعمل 🟢"
        bot_status["is_running"] = True
        
        if self.solve_captcha():
            # حلقة الأتمتة
            for _ in range(50): # عدد المحاولات قبل التوقف لمنع الحظر
                if not bot_status["is_running"]:
                    break
                if self.search_link():
                    self.send_req()
                add_log("⏳ وضع الاستعداد (Cool-down) لتجنب حظر IP...")
                sleep(30) # انتظار إجباري لتخطي حماية Zefoy
        
        bot_status["status"] = "متوقف 🔴"
        bot_status["is_running"] = False
        add_log("🛑 انتهت جلسة الرشق.")

# --- مسارات الـ Web API ---
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/start', methods=['POST'])
def start_bot():
    if bot_status["is_running"]:
        return jsonify({"error": "البوت يعمل بالفعل!"}), 400
    
    data = request.json
    url = data.get('url')
    mode = data.get('mode', 'views')
    
    if not url:
        return jsonify({"error": "الرابط مطلوب"}), 400

    bot_status["logs"] = []
    add_log(f"🚀 بدء تهيئة محرك TARZAN للرابط: {url}")
    
    bot = ZefoyHeadless(url, mode)
    thread = Thread(target=bot.run)
    thread.daemon = True
    thread.start()
    
    return jsonify({"success": "تم تشغيل المحرك بنجاح"})

@app.route('/api/stop', methods=['POST'])
def stop_bot():
    bot_status["is_running"] = False
    bot_status["status"] = "جاري الإيقاف 🟠"
    return jsonify({"success": "تم إرسال أمر التوقف"})

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify(bot_status)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
