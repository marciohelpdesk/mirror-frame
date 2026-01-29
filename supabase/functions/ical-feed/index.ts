import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Job {
  id: string;
  client_name: string;
  address: string;
  date: string;
  time: string;
  checkout_time: string | null;
  checkin_deadline: string | null;
  status: string;
  type: string;
}

// Format date to iCal format (YYYYMMDDTHHMMSS)
function formatICalDate(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split('-');
  const [hour, minute] = timeStr.split(':');
  return `${year}${month}${day}T${hour}${minute}00`;
}

// Escape special characters for iCal
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

// Generate a unique UID for each event
function generateUID(jobId: string): string {
  return `${jobId}@pur-checkclean.lovable.app`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');
    
    if (!userId) {
      return new Response('Missing user_id parameter', { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch jobs for the user
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('id, client_name, address, date, time, checkout_time, checkin_deadline, status, type')
      .eq('user_id', userId)
      .in('status', ['SCHEDULED', 'IN_PROGRESS'])
      .order('date', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return new Response('Failed to fetch jobs', { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      });
    }

    // Generate iCal content
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Pur CheckClean//Cleaning Jobs//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Pur CheckClean - Jobs',
      'X-WR-TIMEZONE:America/Sao_Paulo',
    ];

    for (const job of (jobs as Job[]) || []) {
      const startTime = job.checkout_time || job.time;
      const endTime = job.checkin_deadline || job.time;
      
      const dtStart = formatICalDate(job.date, startTime);
      const dtEnd = formatICalDate(job.date, endTime);
      
      const statusEmoji = job.status === 'SCHEDULED' ? '📅' : '🔄';
      const summary = `${statusEmoji} ${escapeICalText(job.client_name)} - ${job.type}`;
      const description = escapeICalText(
        `Endereço: ${job.address}\\n` +
        `Tipo: ${job.type}\\n` +
        `Status: ${job.status}\\n` +
        `Check-out: ${startTime}\\n` +
        `Check-in: ${endTime}`
      );

      icalContent.push(
        'BEGIN:VEVENT',
        `UID:${generateUID(job.id)}`,
        `DTSTAMP:${timestamp}`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${escapeICalText(job.address)}`,
        'STATUS:CONFIRMED',
        'BEGIN:VALARM',
        'TRIGGER:-PT30M',
        'ACTION:DISPLAY',
        'DESCRIPTION:Limpeza em 30 minutos',
        'END:VALARM',
        'END:VEVENT'
      );
    }

    icalContent.push('END:VCALENDAR');

    return new Response(icalContent.join('\r\n'), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="pur-checkclean.ics"',
      },
    });
  } catch (error) {
    console.error('Error generating iCal:', error);
    return new Response('Internal server error', { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    });
  }
});
