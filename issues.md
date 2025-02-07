1. Program Management : :on create program dialouge  we do not need level, we need to assign academic calendar  also when i click create program nothing happens it should successfully add program

2. Academic calendar: errro Error: Route "/dashboard/[role]/academic-calendar" used `params.role`. `params` should be awaited before using its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at role (src\app\dashboard\[role]\layout.tsx:54:44)
  52 |   const session = await getServerAuthSession();
  53 |   // Await the role parameter
> 54 |   const role = await Promise.resolve(params.role);
     |                                            ^
  55 |
  56 |   if (!session) {
  57 |     redirect("/auth/signin");
 GET /dashboard/super_admin/academic-calendar 200 in 11455ms
 ✓ Compiled /api/auth/[...nextauth] in 414ms (2453 modules)
[next-auth][warn][DEBUG_ENABLED] 
https://next-auth.js.org/warnings#debug_enabled
 GET /api/auth/session 200 in 925ms

We need ptoper calendar management , create caledaner component, update calnedar management when in week,month view user can seeldt dataes and add, edit , updat created events event name, description and event dates from and to , on adding event highligh event in calendar and show success message,

3. Class Management: move create and edit class in react dialouge and add sucsess and errro messeges, for teachers  make search and select teachers. also create class detail view with class dashboard and details of students view  on clicking class student student profile view opens,

4. classroom: ✓ Compiled /dashboard/[role]/classroom in 2.7s (4778 modules)
[next-auth][warn][DEBUG_ENABLED] 
https://next-auth.js.org/warnings#debug_enabled
Error: Route "/dashboard/[role]/classroom" used `params.role`. `params` should be awaited before using its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at role (src\app\dashboard\[role]\layout.tsx:54:44)
  52 |   const session = await getServerAuthSession();
  53 |   // Await the role parameter
> 54 |   const role = await Promise.resolve(params.role);
     |                                            ^
  55 |
  56 |   if (!session) {
  57 |     redirect("/auth/signin");

move create edit and view of teacher in react diallouge and comlete teacher detailed profile assigned subjects and classes

5. Subjects: errros: 1 of 4 errors
Next.js (15.1.5) out of date (learn more)
Console Error

[[ << query #3 ]program.getAllPrograms {}

2 of 4 errors
Next.js (15.1.5) out of date (learn more)
Console Error

[[ << query #5 ]program.getAllPrograms {}

make edit subject in react dialouge with proper sucess and error messeges whule adding updating subject


6. super admin sidebar is not showing, update sidebars in all roles

7. for now messeging showing 404 errro fix it and impliment messeging and notifications in all roles and add sidebars as per role and notification and messeging access as per role and page so we can test messeging between roles

8: notifications: errros: 2 of 4 errors
Next.js (15.1.5) out of date (learn more)
Console Error

[[ << query #5 ]program.getAllPrograms {}

2 of 8 errors
Next.js (15.1.5) out of date (learn more)
Console Error

[[ << query #4 ]class.getAll {}

3 of 8 errors
Next.js (15.1.5) out of date (learn more)
Console Error

[[ << query #6 ]classGroup.getAll {}

Notification types should be selectable. for scheduling date and time should be selected
for individual users it should be seach and select all users by name and email or phone number also improvise  ui for programs calsses and class group notifications
add sucess and errro messeges on add edit ect.
