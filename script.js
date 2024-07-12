let supabase;

function initSupabase() {
    const SUPABASE_URL = 'https://kqhoawwqcdpbewfhjzfk.supabase.co';
    const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY;

    supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

let isAdmin = false;

async function loadMessages() {
    console.log('Loading messages...');
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error loading messages:', error);
        return;
    }

    console.log('Messages loaded:', data);

    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';

    data.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${message.user_id}: ${message.content}`;
        
        if (isAdmin) {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '删除';
            deleteButton.onclick = () => deleteMessage(message.id);
            messageElement.appendChild(deleteButton);
        }

        messagesDiv.appendChild(messageElement);
    });
}

async function addMessage(content) {
    console.log('Adding message:', content);
    const userId = localStorage.getItem('userId') || generateUserId();
    localStorage.setItem('userId', userId);

    const { data, error } = await supabase
        .from('messages')
        .insert({ user_id: userId, content });

    if (error) {
        console.error('Error adding message:', error);
        return;
    }

    console.log('Message added:', data);
    loadMessages();
}

function generateUserId() {
    return Math.random().toString(36).substr(2, 9);
}

async function deleteMessage(id) {
    const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting message:', error);
        return;
    }

    loadMessages();
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    initSupabase();  // 初始化 Supabase 客户端

    document.getElementById('messageForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const messageInput = document.getElementById('messageInput');
        addMessage(messageInput.value);
        messageInput.value = '';
    });

    document.getElementById('adminLogin').addEventListener('click', () => {
        const password = prompt('请输入管理员密码：');
        if (password === '19941010') {
            isAdmin = true;
            alert('管理员登录成功！');
            loadMessages();
        } else {
            alert('密码错误！');
        }
    });

    loadMessages();
});