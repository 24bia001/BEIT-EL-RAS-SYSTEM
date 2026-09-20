import React,{useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';

const API=import.meta.env.VITE_API_URL||'http://localhost:8080/api';
const roles=['ADMIN','TEACHER','STUDENT'];
const nav={ADMIN:['Overview','Students','Teachers','Subjects','Attendance','Fees','Announcements'],TEACHER:['Overview','My Students','Results','Attendance','Announcements'],STUDENT:['Overview','My Results','Fees Payment','My Attendance','Announcements']};
const labels={ADMIN:'Administrator',TEACHER:'Teacher',STUDENT:'Student'};
async function api(path,opts={}){const session=getSession();const r=await fetch(API+path,{headers:{'Content-Type':'application/json',...(session?.role?{'X-Role':session.role}:{}),...(opts.headers||{})},...opts});let data=null;try{data=await r.json()}catch{} if(!r.ok)throw new Error(data?.message||`Request failed (${r.status})`);return data}
function getSession(){try{return JSON.parse(localStorage.getItem('ber_session'))}catch{return null}}
function App(){const [session,setSession]=useState(getSession()); if(!session)return <Landing onLogin={setSession}/>; return <Dashboard session={session} onLogout={()=>{localStorage.removeItem('ber_session');setSession(null)}}/>}
function Landing({onLogin}){const [login,setLogin]=useState(false);return <div className="landing"><div className="hero"><div className="brand">BEIT EL RAS <span>ACADEMY</span></div><nav><a href="#about">About</a><a href="#life">School Life</a><a href="#contact">Contact</a><button onClick={()=>setLogin(true)}>Login</button></nav><div className="hero-copy"><p className="eyebrow">LEARN • GROW • LEAD</p><h1>Beit El Ras<br/><em>School Management</em></h1><p>One connected place for school administration, teaching, learning, attendance, results, fees and announcements.</p><button className="primary" onClick={()=>setLogin(true)}>Enter School Portal →</button></div></div><section id="about" className="info"><div><p className="eyebrow">OUR SCHOOL</p><h2>Organised for every member of the school community.</h2></div><p>Beit El Ras brings administrators, teachers and students into separate, focused workspaces. Each role sees only the tools and information needed for their daily work.</p><div className="cards"><article><b>Administration</b><span>Manage people, subjects, attendance, fees and school-wide announcements.</span></article><article><b>Teaching</b><span>Submit results, monitor attendance and receive important school notices.</span></article><article><b>Students</b><span>Access results, record attendance, pay fees and stay informed.</span></article></div></section><section id="life" className="quote"><span>BEIT EL RAS</span><h2>Clear information. Better decisions. A stronger school community.</h2></section><footer id="contact">© {new Date().getFullYear()} Beit El Ras School • School Management System</footer>{login&&<LoginModal onClose={()=>setLogin(false)} onSuccess={onLogin}/>}</div>}
function LoginModal({onClose,onSuccess}){const [form,setForm]=useState({identifier:'',password:'',role:'STUDENT'});const [busy,setBusy]=useState(false);const [err,setErr]=useState('');const isStudent=form.role==='STUDENT';const isAdmin=form.role==='ADMIN';const identifierLabel=isStudent?'Registration Number':isAdmin?'Administrator Email':'Teacher Email';const placeholder=isStudent?'e.g. ST001':isAdmin?'admin@school.com':'teacher@beitelras.ac.tz';async function submit(e){e.preventDefault();setBusy(true);setErr('');try{const data=await api('/auth/login',{method:'POST',body:JSON.stringify(form)});localStorage.setItem('ber_session',JSON.stringify(data));onSuccess(data)}catch(x){setErr(x.message)}finally{setBusy(false)}}return <div className="modal"><div className="modal-box"><button className="close" onClick={onClose}>×</button><p className="eyebrow">BEIT EL RAS PORTAL</p><h2>Sign in</h2><form onSubmit={submit}><label>Portal<select value={form.role} onChange={e=>setForm({...form,role:e.target.value,identifier:''})}>{roles.map(r=><option key={r}>{r}</option>)}</select></label><label>{identifierLabel}<input type={isStudent?'text':'email'} required value={form.identifier} placeholder={placeholder} onChange={e=>setForm({...form,identifier:e.target.value})}/></label><label>Password<input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>{err&&<div className="error">{err}</div>}<button className="primary full" disabled={busy}>{busy?'Signing in…':'Sign in'}</button></form><p className="hint">Admin: admin@school.com / Admin@123</p><p className="hint">Demo student: ST001 / Student@123</p><p className="hint">Demo teacher: teacher@beitelras.ac.tz / Teacher@123</p></div></div>}
function Dashboard({session,onLogout}){const [active,setActive]=useState('Overview');return <div className="app"><aside className="sidebar"><div className="side-brand">BEIT EL RAS<span>ACADEMY</span></div><div className="role-pill">{labels[session.role]}</div><div className="nav">{nav[session.role].map(x=><button className={active===x?'active':''} onClick={()=>setActive(x)} key={x}><span>{icon(x)}</span>{x}</button>)}</div><div className="side-bottom"><div className="avatar">{(session.name||'U').charAt(0)}</div><div><b>{session.name}</b><small>{session.email}</small></div><button className="logout" onClick={onLogout}>Logout</button></div></aside><main className="main"><header><div><p className="eyebrow">{labels[session.role]} PORTAL</p><h1>{active}</h1></div><div className="top-user"><div className="avatar">{(session.name||'U').charAt(0)}</div><span>{session.name}</span></div></header><Content session={session} active={active}/></main></div>}
function icon(x){return ({Overview:'⌂',Students:'♙',Teachers:'♟',Subjects:'▦',Attendance:'✓',Fees:'◉',Announcements:'◌','My Students':'♟',Results:'✦','My Results':'✦','Fees Payment':'◉','My Attendance':'✓'})[x]||'•'}
function Content({session,active}){if(session.role==='ADMIN')return <AdminPage active={active}/>;if(session.role==='TEACHER')return <TeacherPage session={session} active={active}/>;return <StudentPage session={session} active={active}/>}
function useResource(path){const [data,setData]=useState([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');const load=()=>{setLoading(true);api(path).then(setData).catch(e=>setError(e.message)).finally(()=>setLoading(false))};useEffect(load,[]);return {data,setData,loading,error,reload:load}}
function AdminPage({active}){const stats=useResource('/dashboard');const students=useResource('/students');const teachers=useResource('/teachers');const subjects=useResource('/subjects');if(active==='Overview')return <Overview stats={stats.data}/>;if(active==='Students')return <Crud title="Students" path="/students" fields={studentFields} resource={students}/>;if(active==='Teachers')return <Crud title="Teachers" path="/teachers" fields={teacherFields} resource={teachers}/>;if(active==='Subjects')return <Crud title="Subjects" path="/subjects" fields={subjectFields} resource={subjects}/>;if(active==='Attendance')return <AttendanceAdmin/>;if(active==='Fees')return <FeesAdmin/>;return <AnnouncementsAdmin/>}
function Overview({stats}){return <div className="page"><div className="stat-grid"><Stat label="Students" value={stats?.students??'—'}/><Stat label="Teachers" value={stats?.teachers??'—'}/><Stat label="Subjects" value={stats?.subjects??'—'}/><Stat label="Fees received" value={stats?.payments!=null?money(stats.payments):'—'}/></div><div className="panel"><p className="eyebrow">WELCOME</p><h2>Beit El Ras administration centre</h2><p>Use the sidebar to manage school records without mixing students, teachers, subjects, attendance, fees and announcements into one screen.</p></div></div>}
function Stat({label,value}){return <div className="stat"><span>{label}</span><strong>{value}</strong></div>}
const studentFields=[['admissionNo','Registration No'],['fullName','Full Name'],['email','Email'],['password','Password'],['phone','Phone'],['gender','Gender'],['className','Class'],['parentName','Parent Name'],['parentPhone','Parent Phone']];
const teacherFields=[['employeeNo','Employee No'],['fullName','Full Name'],['email','Email'],['password','Password'],['phone','Phone'],['department','Department'],['specialization','Specialization']];
const subjectFields=[['code','Code'],['name','Name'],['description','Description']];
function Crud({title,path,fields,resource}){const [editing,setEditing]=useState(null);const [form,setForm]=useState({});const [msg,setMsg]=useState('');const rows=resource.data||[];function edit(r){setEditing(r.id);setForm(Object.fromEntries(fields.map(([k])=>[k,''])));setForm(Object.fromEntries(fields.map(([k])=>[k,k==='password'?'':(r[k]??'')])))}function reset(){setEditing(null);setForm({})}async function save(e){e.preventDefault();try{const payload={...form};if(editing&&payload.password==='')delete payload.password;await api(editing?`${path}/${editing}`:path,{method:editing?'PUT':'POST',body:JSON.stringify(payload)});setMsg(editing?'Updated successfully':'Added successfully');reset();resource.reload()}catch(x){setMsg(x.message)}}async function del(id){if(!confirm('Delete this record?'))return;try{await api(`${path}/${id}`,{method:'DELETE'});resource.reload()}catch(x){setMsg(x.message)}}return <div className="page"><div className="section-head"><div><p className="eyebrow">MANAGEMENT</p><h2>{title}</h2></div><button className="primary" onClick={reset}>+ Add {title.slice(0,-1)}</button></div>{msg&&<div className="notice">{msg}</div>}<div className="panel form-panel"><form className="grid-form" onSubmit={save}>{fields.map(([k,l])=><label key={k}>{l}<input type={k==='password'?'password':'text'} value={form[k]??''} onChange={e=>setForm({...form,[k]:e.target.value})} required={!editing&&(k==='password'||k==='fullName'||k==='admissionNo'||k==='employeeNo'||k==='code'||k==='name')}/></label>)}<div className="form-actions"><button className="primary">{editing?'Update':'Save'}</button>{editing&&<button type="button" className="ghost" onClick={reset}>Cancel</button>}</div></form></div><Table rows={rows} columns={fields.filter(f=>f[0]!=='password').map(f=>f[0])} labels={fields.filter(f=>f[0]!=='password').map(f=>f[1])} onEdit={edit} onDelete={del}/></div>}
function Table({rows,columns,labels,onEdit,onDelete}){const hasActions=Boolean(onEdit||onDelete);return <div className="panel table-wrap"><table><thead><tr>{labels.map(l=><th key={l}>{l}</th>)}{hasActions&&<th>Actions</th>}</tr></thead><tbody>{rows.map(r=><tr key={r.id}>{columns.map(c=><td key={c}>{r[c]??'—'}</td>)}{hasActions&&<td className="actions">{onEdit&&<button onClick={()=>onEdit(r)}>Edit</button>}{onDelete&&<button className="danger" onClick={()=>onDelete(r.id)}>Delete</button>}</td>}</tr>)}{!rows.length&&<tr><td colSpan={labels.length+(hasActions?1:0)} className="empty">No records yet.</td></tr>}</tbody></table></div>}
function AttendanceAdmin(){const r=useResource('/attendance');const [students]=[useResource('/students')];return <div className="page"><SectionTitle title="Attendance" subtitle="Review attendance submitted for students."/><Table rows={r.data} columns={['studentId','date','status','remarks']} labels={['Student ID','Date','Status','Remarks']} onEdit={()=>{}} onDelete={async id=>{if(confirm('Delete attendance?')){await api('/attendance/'+id,{method:'DELETE'});r.reload()}}}/><div className="panel"><b>{students.data.length}</b> students are registered.</div></div>}
function FeesAdmin(){const r=useResource('/payments');return <div className="page"><SectionTitle title="Fees" subtitle="See all student fee payments."/><div className="stat-grid"><Stat label="Total received" value={money(r.data.reduce((a,x)=>a+(x.amount||0),0))}/><Stat label="Transactions" value={r.data.length}/></div><Table rows={r.data} columns={['studentId','amount','reference','method','paymentDate']} labels={['Student ID','Amount','Reference','Method','Date']} onEdit={()=>{}} onDelete={async id=>{if(confirm('Delete payment?')){await api('/payments/'+id,{method:'DELETE'});r.reload()}}}/></div>}
function AnnouncementsAdmin(){const r=useResource('/announcements');const [form,setForm]=useState({title:'',message:'',audience:'ALL'});async function add(e){e.preventDefault();await api('/announcements',{method:'POST',body:JSON.stringify(form)});setForm({title:'',message:'',audience:'ALL'});r.reload()}return <div className="page"><SectionTitle title="Announcements" subtitle="Publish notices for teachers and students."/><div className="panel"><form className="grid-form" onSubmit={add}><label>Title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Audience<select value={form.audience} onChange={e=>setForm({...form,audience:e.target.value})}><option>ALL</option><option>TEACHER</option><option>STUDENT</option></select></label><label className="wide">Message<textarea required value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/></label><button className="primary">Publish announcement</button></form></div><div className="announcement-list">{r.data.map(x=><article className="panel" key={x.id}><div><b>{x.title}</b><span className="tag">{x.audience}</span></div><p>{x.message}</p><small>{x.createdAt?new Date(x.createdAt).toLocaleString():''}</small></article>)}</div></div>}
function TeacherPage({session,active}){const students=useResource('/students');const subjects=useResource('/subjects');const results=useResource('/results');const announcements=useResource('/announcements');if(active==='Overview')return <div className="page"><div className="stat-grid"><Stat label="Students" value={students.data.length}/><Stat label="Results submitted" value={results.data.length}/><Stat label="Announcements" value={announcements.data.filter(a=>a.audience==='ALL'||a.audience==='TEACHER').length}/></div><PanelList title="Recent announcements" rows={announcements.data.filter(a=>a.audience==='ALL'||a.audience==='TEACHER').slice(0,4)}/></div>;if(active==='My Students')return <div className="page"><SectionTitle title="My Students" subtitle="Student records available for teaching and results entry."/><Table rows={students.data} columns={['id','admissionNo','fullName','className','email']} labels={['ID','Admission','Name','Class','Email']} onEdit={()=>{}} onDelete={()=>{}}/></div>;if(active==='Results')return <TeacherResults students={students.data} subjects={subjects.data} resource={results}/>;if(active==='Attendance')return <TeacherAttendance students={students.data}/>;return <div className="page"><PanelList title="Announcements from administration" rows={announcements.data.filter(a=>a.audience==='ALL'||a.audience==='TEACHER')}/></div>}
function gradeFromMarks(marks){
    const m=Number(marks);
    if(Number.isNaN(m)) return '—';
    if(m>=90) return 'A';
    if(m>=70) return 'B';
    if(m>=50) return 'C';
    if(m>=30) return 'D';
    return 'F';
}
function TeacherResults({students,subjects,resource}){
    const [f,setF]=useState({studentId:'',subjectId:'',marks:''});
    const [msg,setMsg]=useState('');
    async function save(e){
        e.preventDefault();
        setMsg('');
        const marks=Number(f.marks);
        if(marks<0 || marks>100){setMsg('Marks must be between 0 and 100.');return}
        try{
            const selected=subjects.find(s=>String(s.id)===String(f.subjectId));
            await api('/results',{
                method:'POST',
                body:JSON.stringify({
                    studentId:Number(f.studentId),
                    subject:selected?selected.name:'',
                    marks
                })
            });
            setF({studentId:'',subjectId:'',marks:''});
            setMsg('Result saved successfully.');
            resource.reload()
        }catch(x){setMsg(x.message)}
    }
    const rows=(resource.data||[]).map(result=>{
        const student=students.find(s=>String(s.id)===String(result.studentId));
        return {
            ...result,
            registrationNo:student?.admissionNo||'—',
            fullName:student?.fullName||'—',
            displayGrade:gradeFromMarks(result.marks)
        };
    });
    return <div className="page">
        <SectionTitle title="Submit Results" subtitle="Enter marks for an individual student. The grade is calculated automatically."/>
        <div className="panel">
            <form className="grid-form" onSubmit={save}>
                <label>Student
                    <select required value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}>
                        <option value="">Select student</option>
                        {students.map(s=><option value={s.id} key={s.id}>{s.admissionNo} — {s.fullName}</option>)}
                    </select>
                </label>
                <label>Subject
                    <select required value={f.subjectId} onChange={e=>setF({...f,subjectId:e.target.value})}>
                        <option value="">Select subject</option>
                        {subjects.map(s=><option value={s.id} key={s.id}>{s.code} — {s.name}</option>)}
                    </select>
                </label>
                <label>Marks (0–100)
                    <input type="number" min="0" max="100" step="1" required value={f.marks} onChange={e=>setF({...f,marks:e.target.value})}/>
                </label>
                <button className="primary">Save result</button>
            </form>
            {msg&&<div className="notice">{msg}</div>}
            <div className="grade-guide"><b>Grade scale:</b> 0–29 = F • 30–49 = D • 50–69 = C • 70–89 = B • 90–100 = A</div>
        </div>
        <div className="panel table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Registration Number</th>
                        <th>Full Name</th>
                        <th>Subject</th>
                        <th>Marks</th>
                        <th>Grade</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(r=><tr key={r.id}>
                        <td>{r.registrationNo}</td>
                        <td>{r.fullName}</td>
                        <td>{r.subject||'—'}</td>
                        <td>{r.marks??'—'}</td>
                        <td>{r.displayGrade}</td>
                        <td className="actions">
                            <button onClick={()=>{}}>Edit</button>
                            <button className="danger" onClick={async()=>{
                                if(confirm('Delete result?')){
                                    await api('/results/'+r.id,{method:'DELETE'});
                                    resource.reload()
                                }
                            }}>Delete</button>
                        </td>
                    </tr>)}
                    {!rows.length&&<tr><td colSpan="6" className="empty">No results yet.</td></tr>}
                </tbody>
            </table>
        </div>
    </div>
}

function TeacherAttendance({students}){const [f,setF]=useState({studentId:'',date:new Date().toISOString().slice(0,10),status:'PRESENT',remarks:''});const [msg,setMsg]=useState('');async function save(e){e.preventDefault();try{await api('/attendance',{method:'POST',body:JSON.stringify({...f,studentId:Number(f.studentId)})});setMsg('Attendance saved.')}catch(x){setMsg(x.message)}}return <div className="page"><SectionTitle title="Record Attendance" subtitle="Mark attendance for a student."/><div className="panel"><form className="grid-form" onSubmit={save}><label>Student<select required value={f.studentId} onChange={e=>setF({...f,studentId:e.target.value})}><option value="">Select student</option>{students.map(s=><option value={s.id} key={s.id}>{s.fullName}</option>)}</select></label><label>Date<input type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></label><label>Status<select value={f.status} onChange={e=>setF({...f,status:e.target.value})}><option>PRESENT</option><option>ABSENT</option><option>LATE</option></select></label><label>Remarks<input value={f.remarks} onChange={e=>setF({...f,remarks:e.target.value})}/></label><button className="primary">Save attendance</button></form>{msg&&<div className="notice">{msg}</div>}</div></div>}
function StudentPage({session,active}){const students=useResource('/students');const student=students.data.find(s=>s.id===session.id || s.admissionNo===session.admissionNo);const results=useResource('/results');const payments=useResource('/payments');const attendance=useResource('/attendance');const announcements=useResource('/announcements');const myResults=results.data.filter(x=>x.studentId===student?.id);const myPayments=payments.data.filter(x=>x.studentId===student?.id);const myAttendance=attendance.data.filter(x=>x.studentId===student?.id);if(active==='Overview')return <div className="page"><div className="profile panel"><div className="big-avatar">{(session.name||'S').charAt(0)}</div><div><p className="eyebrow">STUDENT</p><h2>{session.name}</h2><p>{student?.admissionNo||'Admission number not linked yet'} • {student?.className||'Class not set'}</p></div></div><div className="stat-grid"><Stat label="Results" value={myResults.length}/><Stat label="Fees paid" value={money(myPayments.reduce((a,x)=>a+(x.amount||0),0))}/><Stat label="Attendance records" value={myAttendance.length}/></div><PanelList title="Latest announcements" rows={announcements.data.filter(a=>a.audience==='ALL'||a.audience==='STUDENT').slice(0,4)}/></div>;if(active==='My Results')return <div className="page"><SectionTitle title="My Exam Results" subtitle="Only your results are shown here."/><Table rows={myResults} columns={['subject','marks','grade']} labels={['Subject','Marks','Grade']}/></div>;if(active==='Fees Payment')return <StudentFees student={student} resource={payments}/>;if(active==='My Attendance')return <div className="page"><SectionTitle title="My Attendance" subtitle="Your attendance history."/><Table rows={myAttendance} columns={['date','status','remarks']} labels={['Date','Status','Remarks']}/></div>;return <div className="page"><PanelList title="Announcements" rows={announcements.data.filter(a=>a.audience==='ALL'||a.audience==='STUDENT')}/></div>}
function StudentFees({student,resource}){const [f,setF]=useState({amount:'',reference:'',method:'CASH'});const [msg,setMsg]=useState('');async function pay(e){e.preventDefault();if(!student){setMsg('Your account is not linked to a student record. Ask the administrator to confirm your registration number is correct.');return}try{await api('/payments',{method:'POST',body:JSON.stringify({studentId:student.id,amount:Number(f.amount),reference:f.reference,method:f.method})});setMsg('Payment recorded successfully.');setF({amount:'',reference:'',method:'CASH'});resource.reload()}catch(x){setMsg(x.message)}}return <div className="page"><SectionTitle title="Fees Payment" subtitle="Record a fee payment and keep your payment history."/><div className="panel"><form className="grid-form" onSubmit={pay}><label>Amount<input type="number" min="1" required value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/></label><label>Reference<input required value={f.reference} onChange={e=>setF({...f,reference:e.target.value})}/></label><label>Method<select value={f.method} onChange={e=>setF({...f,method:e.target.value})}><option>CASH</option><option>BANK</option><option>MOBILE</option><option>CARD</option></select></label><button className="primary">Record payment</button></form>{msg&&<div className="notice">{msg}</div>}</div><Table rows={(resource.data||[]).filter(x=>x.studentId===student?.id)} columns={['amount','reference','method','paymentDate']} labels={['Amount','Reference','Method','Date']}/></div>}
function PanelList({title,rows}){return <div className="panel"><div className="section-head"><h3>{title}</h3><span className="muted">{rows.length} item(s)</span></div>{rows.length?rows.map(x=><div className="announcement" key={x.id}><div><b>{x.title}</b><span className="tag">{x.audience}</span></div><p>{x.message}</p><small>{x.createdAt?new Date(x.createdAt).toLocaleString():''}</small></div>):<div className="empty">No announcements yet.</div>}</div>}
function SectionTitle({title,subtitle}){return <div className="section-title"><p className="eyebrow">BEIT EL RAS</p><h2>{title}</h2><p>{subtitle}</p></div>}
function money(n){return new Intl.NumberFormat('en-TZ',{style:'currency',currency:'TZS',maximumFractionDigits:0}).format(n||0)}
createRoot(document.getElementById('root')).render(<App/>);
