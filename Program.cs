using Microsoft.Data.SqlClient;
using System.Data;
using UMS.Services.Interfaces;
using UMS.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

builder.Services.AddScoped<IDbConnection>(sp =>
{
    var configuration = sp.GetRequiredService<IConfiguration>();

    return new SqlConnection(
        configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddScoped<UMS.Services.Interfaces.IRegistrationUserService, UMS.Services.RegistrationUserService>();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();