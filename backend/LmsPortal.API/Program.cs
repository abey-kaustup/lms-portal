using System.Text;
using LmsPortal.API.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// 1. Serilog Logging for .NET 10.0
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("Logs/lms-audit-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// 2. EF Core MS SQL Server Setup (.NET 10)
builder.Services.AddDbContext<LmsDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection") ?? "Server=localhost,1433;Database=LmsPortalDb;User Id=sa;Password=YourPassword123!;Encrypt=True;TrustServerCertificate=True;MultipleActiveResultSets=true;",
        sqlOptions => sqlOptions.EnableRetryOnFailure(maxRetryCount: 5, maxRetryDelay: TimeSpan.FromSeconds(30), errorNumbersToAdd: null)
    ));

// Gamification Service Registration
builder.Services.AddScoped<LmsPortal.API.Services.IGamificationService, LmsPortal.API.Services.GamificationService>();

// 3. ASP.NET Core 10 JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["Secret"] ?? "SUPER_SECRET_ENTERPRISE_JWT_KEY_LMS_PORTAL_2026_PRODUCTION_MUST_BE_VERY_LONG!");

builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options => {
    options.RequireHttpsMetadata = false; // Dev environment flexibility
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "LmsPortalAPI",
        ValidAudience = jwtSettings["Audience"] ?? "LmsPortalClient",
        IssuerSigningKey = new SymmetricSecurityKey(secretKey),
        ClockSkew = TimeSpan.FromSeconds(10)
    };
});

// 4. Role Authorization Policies
builder.Services.AddAuthorization(options => {
    options.AddPolicy("RequireHRAdmin", policy => policy.RequireRole("HR_ADMIN"));
    options.AddPolicy("RequireEmployee", policy => policy.RequireRole("EMPLOYEE"));
});

// 5. CORS for Next.js Frontend Client
builder.Services.AddCors(options => {
    options.AddPolicy("NextJsClient", policy => {
        policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Enable Swagger API Documentation UI for all environments
app.UseSwagger();
app.UseSwaggerUI(c => {
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "LMS Portal API v1");
    c.RoutePrefix = "swagger";
});

// Redirect root endpoint "/" directly to Swagger UI
app.MapGet("/", () => Results.Redirect("/swagger/index.html"));

app.UseSerilogRequestLogging();
app.UseCors("NextJsClient");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
