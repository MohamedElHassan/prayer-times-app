// تحديد إحداثيات كفر الدوار
const latitude = 31.1338;
const longitude = 30.1285;

// تحديث التاريخ الهجري والميلادي
function updateDates() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('gregorian-date').textContent = today.toLocaleDateString('ar-EG', options);

    // تحويل التاريخ الميلادي إلى هجري
    const islamicDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(today);
    document.getElementById('hijri-date').textContent = islamicDate;
}

// دالة للحصول على مواقيت الصلاة
async function getPrayerTimes() {
    try {
        const today = new Date();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();

        const response = await fetch(`https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=5`);
        const data = await response.json();

        if (data.code === 200) {
            const todayTimings = data.data[today.getDate() - 1].timings;
            updatePrayerTimes(todayTimings);
            updateNextPrayer(todayTimings);
        }
    } catch (error) {
        console.error('Error fetching prayer times:', error);
    }
}

// تحديث مواقيت الصلاة في الواجهة
function updatePrayerTimes(timings) {
    document.getElementById('fajr-time').textContent = formatTime(timings.Fajr);
    document.getElementById('sunrise-time').textContent = formatTime(timings.Sunrise);
    document.getElementById('dhuhr-time').textContent = formatTime(timings.Dhuhr);
    document.getElementById('asr-time').textContent = formatTime(timings.Asr);
    document.getElementById('maghrib-time').textContent = formatTime(timings.Maghrib);
    document.getElementById('isha-time').textContent = formatTime(timings.Isha);
}

// تنسيق الوقت
function formatTime(timeString) {
    const time = timeString.split(' ')[0];
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    
    // تحويل إلى نظام 12 ساعة
    const period = hour >= 12 ? 'مساءً' : 'صباحاً';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${period}`;
}

// تحديث الصلاة القادمة والعد التنازلي
function updateNextPrayer(timings) {
    const prayers = [
        { name: 'الفجر', time: timings.Fajr },
        { name: 'الشروق', time: timings.Sunrise },
        { name: 'الظهر', time: timings.Dhuhr },
        { name: 'العصر', time: timings.Asr },
        { name: 'المغرب', time: timings.Maghrib },
        { name: 'العشاء', time: timings.Isha }
    ];

    const now = new Date();
    let nextPrayer = null;

    for (const prayer of prayers) {
        const prayerTime = new Date();
        const [hours, minutes] = prayer.time.split(':');
        prayerTime.setHours(parseInt(hours), parseInt(minutes), 0);

        if (prayerTime > now) {
            nextPrayer = { name: prayer.name, time: prayerTime };
            break;
        }
    }

    if (!nextPrayer) {
        // إذا مرت كل الصلوات، فالصلاة القادمة هي فجر اليوم التالي
        nextPrayer = {
            name: 'الفجر',
            time: new Date(now.getTime() + 24 * 60 * 60 * 1000)
        };
    }

    document.getElementById('next-prayer-name').textContent = nextPrayer.name;
    updateCountdown(nextPrayer.time);
}

// تحديث العد التنازلي
function updateCountdown(nextPrayerTime) {
    setInterval(() => {
        const now = new Date();
        const diff = nextPrayerTime - now;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('countdown').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// تحديث الساعة
function updateClocks() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // تحديث الساعة الرقمية
    const hour12 = hours % 12 || 12;
    const period = hours >= 12 ? 'مساءً' : 'صباحاً';
    document.getElementById('digital-clock').textContent = 
        `${hour12}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;

    // تحديث الساعة التناظرية
    const hourDeg = (hours % 12) * 30 + minutes * 0.5; // كل ساعة 30 درجة + نسبة الدقائق
    const minuteDeg = minutes * 6; // كل دقيقة 6 درجات
    const secondDeg = seconds * 6; // كل ثانية 6 درجات

    const hourHand = document.querySelector('.hour-hand');
    const minuteHand = document.querySelector('.minute-hand');
    const secondHand = document.querySelector('.second-hand');

    hourHand.style.transform = `rotate(${hourDeg}deg)`;
    minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
    secondHand.style.transform = `rotate(${secondDeg}deg)`;
}

// إدارة الوضع الليلي
function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const icon = themeToggleBtn.querySelector('i');
    const text = themeToggleBtn.querySelector('span');

    // التحقق من الوضع المحفوظ
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        icon.classList.replace('fa-moon', 'fa-sun');
        text.textContent = 'الوضع النهاري';
    }

    // تبديل الوضع عند النقر على الزر
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        if (newTheme === 'dark') {
            icon.classList.replace('fa-moon', 'fa-sun');
            text.textContent = 'الوضع النهاري';
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            text.textContent = 'الوضع الليلي';
        }
    });
}

// تحديث البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    updateDates();
    getPrayerTimes();
    initThemeToggle();
    
    // تحديث الساعة كل ثانية
    updateClocks();
    setInterval(updateClocks, 1000);
    
    // تحديث مواقيت الصلاة كل دقيقة
    setInterval(getPrayerTimes, 60000);
});
