// ОНОВЛЕНО: Вказуємо останню стабільну версію @v0.2.0
import * as webpush from "https://denopkg.com/iamnathanj/web_push@v0.2.0/mod.ts";

// ----- РЕШТА КОДУ ЗАЛИШАЄТЬСЯ БЕЗ ЗМІН -----
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const newMessage = payload.record;

    if (newMessage.sender !== 'user') {
      return new Response('Not a user message, skipping notification.', { status: 200 });
    }
    
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!vapidPublicKey || !vapidPrivateKey || !supabaseServiceRoleKey || !supabaseUrl) {
      console.error('CRITICAL: Missing one or more required environment variables!');
      throw new Error('Server configuration error: Missing environment variables.');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: subscriptions, error: subsError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('subscription');

    if (subsError) throw subsError;

    const notificationPayload = JSON.stringify({
      title: 'Нове повідомлення в чаті! 💬',
      body: newMessage.content.startsWith('http') ? '[Отримано зображення]' : newMessage.content,
    });
    
    webpush.setVapidDetails(
      'mailto:igorkishchuk18@gmail.com',
      vapidPublicKey,
      vapidPrivateKey
    );

    const sendPromises = subscriptions.map(sub => 
      webpush.sendNotification(sub.subscription, notificationPayload)
        .catch(err => {
          if (err.statusCode === 410) {
            console.log('Subscription expired, deleting:', sub.subscription.endpoint);
            return supabaseAdmin.from('push_subscriptions').delete().match({ subscription: sub.subscription });
          } else {
            console.error('Error sending notification:', err.body);
          }
        })
    );
    
    await Promise.all(sendPromises);

    return new Response(JSON.stringify({ message: `Notifications sent to ${subscriptions.length} subscribers.` }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Помилка у функції:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});