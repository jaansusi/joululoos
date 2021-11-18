using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SantaReporter.Migrations
{
    public partial class AddIvToSanta : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IVBase64",
                table: "Santas",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IVBase64",
                table: "Santas");
        }
    }
}
